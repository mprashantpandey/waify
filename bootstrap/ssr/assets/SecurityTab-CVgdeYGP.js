import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, useForm, router } from "@inertiajs/react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Shield, KeyRound, Lock, Save, Trash2 } from "lucide-react";
import { u as useNotifications } from "./useNotifications-DZIlU05F.js";
import { A as Alert } from "./Alert-C-mQ6HNk.js";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-CwsXrmjR.js";
import "./useConfirm-BKf7Nv1N.js";
function SecurityTab() {
  const { confirm, toast } = useNotifications();
  const { props } = usePage();
  const mustVerifyEmail = Boolean(props.mustVerifyEmail);
  const emailVerified = Boolean(props.emailVerified);
  const accounts = Array.isArray(props.accounts) ? props.accounts : [];
  const ownedAccounts = accounts.filter((a) => String(a?.owner_id ?? "") === String(props.auth?.user?.id ?? ""));
  const memberAccounts = accounts.filter((a) => String(a?.owner_id ?? "") !== String(props.auth?.user?.id ?? ""));
  const securityPolicy = props.securityPolicy;
  const twoFactor = props.twoFactor ?? {};
  const twoFactorEnabled = Boolean(twoFactor.enabled);
  const twoFactorPending = Boolean(twoFactor.pending_setup);
  const recoveryCodes = Array.isArray(twoFactor.recovery_codes) ? twoFactor.recovery_codes : [];
  const sessions = props.sessions ?? [];
  const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState(null);
  const { data, setData, put, processing, errors, reset } = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const sessionForm = useForm({
    current_password: ""
  });
  const twoFactorConfirmForm = useForm({
    otp_code: ""
  });
  const twoFactorDisableForm = useForm({
    current_password: ""
  });
  const deleteAccountForm = useForm({
    password: "",
    confirmation_text: ""
  });
  const [showDeleteReview, setShowDeleteReview] = useState(false);
  const [securityAction, setSecurityAction] = useState(null);
  const submit = (e) => {
    e.preventDefault();
    put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => {
        reset();
      },
      onError: () => {
      }
    });
  };
  const deletePrechecks = {
    hasOwnedAccounts: ownedAccounts.length > 0,
    hasMemberAccounts: memberAccounts.length > 0,
    typedConfirmation: deleteAccountForm.data.confirmation_text.trim() === "DELETE",
    hasPassword: deleteAccountForm.data.password.trim().length > 0
  };
  const deleteBlockedByMemberships = deletePrechecks.hasMemberAccounts;
  const deleteAccount = async (e) => {
    e.preventDefault();
    if (deleteBlockedByMemberships) {
      toast.error("Leave or be removed from all tenant teams before deleting your account");
      return;
    }
    if (!deletePrechecks.typedConfirmation || !deletePrechecks.hasPassword) {
      toast.error("Complete the deletion confirmation checks first");
      return;
    }
    const confirmed = await confirm({
      title: "Final Delete Confirmation",
      message: "This will permanently delete your user account. This action cannot be undone.",
      variant: "danger",
      confirmText: "Delete"
    });
    if (!confirmed) return;
    router.delete(route("profile.destroy"), {
      data: { password: deleteAccountForm.data.password },
      // Rely on server flash/redirect handling to avoid false success on blocked deletion.
      onStart: () => setSecurityAction("delete-account"),
      onSuccess: () => {
      },
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  const revokeOtherSessions = (e) => {
    e.preventDefault();
    sessionForm.post(route("app.settings.security.revoke-other-sessions"), {
      preserveScroll: true,
      onStart: () => setSecurityAction("revoke-other-sessions"),
      onSuccess: () => {
        sessionForm.reset();
      },
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  const revokeSession = async (sessionId) => {
    const confirmed = await confirm({
      title: "Revoke Session",
      message: "This device session will be signed out immediately.",
      variant: "danger",
      confirmText: "Revoke"
    });
    if (!confirmed) return;
    router.delete(route("app.settings.security.sessions.revoke", { sessionId }), {
      preserveScroll: true,
      onStart: () => setSecurityAction(`revoke-session:${sessionId}`),
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  useEffect(() => {
    let active = true;
    if (!twoFactorPending || !twoFactor.otpauth_uri) {
      setTwoFactorQrDataUrl(null);
      return () => {
        active = false;
      };
    }
    QRCode.toDataURL(twoFactor.otpauth_uri, {
      width: 220,
      margin: 1
    }).then((url) => {
      if (active) setTwoFactorQrDataUrl(url);
    }).catch(() => {
      if (active) setTwoFactorQrDataUrl(null);
    });
    return () => {
      active = false;
    };
  }, [twoFactorPending, twoFactor.otpauth_uri]);
  const startTwoFactorSetup = () => {
    router.post(route("app.settings.security.2fa.setup"), {}, {
      preserveScroll: true,
      onStart: () => setSecurityAction("2fa-setup"),
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  const cancelTwoFactorSetup = () => {
    router.post(route("app.settings.security.2fa.cancel"), {}, {
      preserveScroll: true,
      onStart: () => setSecurityAction("2fa-cancel"),
      onFinish: () => setSecurityAction(null)
    });
  };
  const confirmTwoFactorSetup = (e) => {
    e.preventDefault();
    twoFactorConfirmForm.post(route("app.settings.security.2fa.confirm"), {
      preserveScroll: true,
      onStart: () => setSecurityAction("2fa-confirm"),
      onSuccess: () => {
        twoFactorConfirmForm.reset();
      },
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  const disableTwoFactor = (e) => {
    e.preventDefault();
    twoFactorDisableForm.post(route("app.settings.security.2fa.disable"), {
      preserveScroll: true,
      onStart: () => setSecurityAction("2fa-disable"),
      onSuccess: () => {
        twoFactorDisableForm.reset();
      },
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  const regenerateRecoveryCodes = () => {
    router.post(route("app.settings.security.2fa.recovery-codes.regenerate"), {}, {
      preserveScroll: true,
      onStart: () => setSecurityAction("2fa-regenerate-codes"),
      onError: () => {
      },
      onFinish: () => setSecurityAction(null)
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Account Security Status" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Email verification, session controls, and enforced platform policy" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-6 space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold mb-2", children: "Email Verification" }),
          emailVerified ? /* @__PURE__ */ jsx(Alert, { variant: "success", children: "Your email is verified." }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(Alert, { variant: "warning", children: "Your email is not verified." }),
            mustVerifyEmail && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: () => router.post(route("app.settings.security.resend-verification"), {}, { preserveScroll: true }),
                className: "w-full sm:w-auto",
                children: "Resend Verification Email"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold mb-2", children: "Security Summary" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Email verification" }),
              /* @__PURE__ */ jsx("span", { className: emailVerified ? "text-green-700 dark:text-green-300 font-medium" : "text-amber-700 dark:text-amber-300 font-medium", children: emailVerified ? "Verified" : "Pending" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Two-factor authentication" }),
              /* @__PURE__ */ jsx("span", { className: twoFactorEnabled ? "text-green-700 dark:text-green-300 font-medium" : "text-gray-700 dark:text-gray-300 font-medium", children: twoFactorEnabled ? "Enabled" : "Not enabled" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-600 dark:text-gray-400", children: "Policy requires 2FA" }),
              /* @__PURE__ */ jsx("span", { className: "text-gray-900 dark:text-gray-100 font-medium", children: securityPolicy?.require_2fa ? "Yes" : "No" })
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-emerald-500 rounded-xl", children: /* @__PURE__ */ jsx(KeyRound, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Two-Factor Authentication (2FA)" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Use an authenticator app (TOTP) for stronger account protection" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsx(Alert, { variant: twoFactorEnabled ? "success" : "warning", children: twoFactorEnabled ? "2FA is enabled on your account." : "2FA is not enabled on your account." }),
        securityPolicy?.require_2fa && !twoFactorEnabled && /* @__PURE__ */ jsx(Alert, { variant: "warning", children: "Platform policy requires 2FA. Set it up now to stay compliant." }),
        !twoFactorEnabled && !twoFactorPending && /* @__PURE__ */ jsx(Button, { onClick: startTwoFactorSetup, disabled: securityAction !== null, className: "w-full sm:w-auto", children: securityAction === "2fa-setup" ? "Starting..." : "Start 2FA Setup" }),
        !twoFactorEnabled && twoFactorPending && /* @__PURE__ */ jsxs("div", { className: "space-y-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Step 1: Add this secret to your authenticator app" }),
            twoFactorQrDataUrl && /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: twoFactorQrDataUrl,
                alt: "2FA QR Code",
                className: "h-44 w-44 sm:h-56 sm:w-56 rounded-lg border border-gray-200 bg-white p-2",
                loading: "lazy"
              }
            ) }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-sm font-mono break-all", children: twoFactor.pending_secret }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "If your app supports manual entry, use the secret above. OTPAuth URI is shown below for compatibility." }),
            /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-xs break-all", children: twoFactor.otpauth_uri })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: confirmTwoFactorSetup, className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "two_factor_otp_code", value: "Step 2: Enter 6-digit code from authenticator app", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "two_factor_otp_code",
                  value: twoFactorConfirmForm.data.otp_code,
                  onChange: (e) => twoFactorConfirmForm.setData("otp_code", e.target.value),
                  className: "block w-full rounded-xl",
                  placeholder: "123456"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: twoFactorConfirmForm.errors.otp_code || twoFactorConfirmForm.errors.two_factor_otp_code, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
              /* @__PURE__ */ jsx(Button, { type: "submit", disabled: twoFactorConfirmForm.processing, className: "w-full sm:w-auto", children: twoFactorConfirmForm.processing ? "Confirming..." : "Enable 2FA" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: cancelTwoFactorSetup, disabled: securityAction !== null || twoFactorConfirmForm.processing, className: "w-full sm:w-auto", children: securityAction === "2fa-cancel" ? "Canceling..." : "Cancel Setup" })
            ] })
          ] })
        ] }),
        twoFactorEnabled && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: regenerateRecoveryCodes, disabled: securityAction !== null, className: "w-full sm:w-auto", children: securityAction === "2fa-regenerate-codes" ? "Regenerating..." : "Regenerate Recovery Codes" }) }),
          recoveryCodes.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-200 dark:border-amber-800 p-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2", children: "Save these recovery codes now (shown once after generation)" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: recoveryCodes.map((code) => /* @__PURE__ */ jsx("div", { className: "rounded bg-amber-50 dark:bg-amber-900/20 px-3 py-2 font-mono text-sm", children: code }, code)) })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: disableTwoFactor, className: "space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "disable_two_factor_password", value: "Current Password (to disable 2FA)", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "disable_two_factor_password",
                  type: "password",
                  value: twoFactorDisableForm.data.current_password,
                  onChange: (e) => twoFactorDisableForm.setData("current_password", e.target.value),
                  className: "block w-full rounded-xl",
                  placeholder: "Enter current password"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: twoFactorDisableForm.errors.current_password || twoFactorDisableForm.errors.disable_two_factor_password, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx(Button, { type: "submit", variant: "danger", disabled: twoFactorDisableForm.processing, className: "w-full sm:w-auto", children: twoFactorDisableForm.processing || securityAction === "2fa-disable" ? "Disabling..." : "Disable 2FA" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-purple-500 rounded-xl", children: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Update Password" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Ensure your account is using a long, random password to stay secure" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "current_password", value: "Current Password", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "current_password",
                type: "password",
                value: data.current_password,
                onChange: (e) => setData("current_password", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true,
                placeholder: "Enter current password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.current_password, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "New Password", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password",
                type: "password",
                value: data.password,
                onChange: (e) => setData("password", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true,
                placeholder: "Enter new password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password_confirmation", value: "Confirm Password", className: "text-sm font-semibold mb-2" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password_confirmation",
                type: "password",
                value: data.password_confirmation,
                onChange: (e) => setData("password_confirmation", e.target.value),
                className: "mt-1 block w-full pl-10 rounded-xl",
                required: true,
                placeholder: "Confirm new password"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.password_confirmation, className: "mt-2" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl",
            children: processing ? "Updating..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-2" }),
              "Update Password"
            ] })
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-slate-100 dark:from-gray-800 dark:to-slate-900", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Sessions & Devices" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Review active sessions and sign out devices you do not recognize" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-5", children: [
        /* @__PURE__ */ jsxs("form", { onSubmit: revokeOtherSessions, className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "revoke_other_sessions_password", value: "Current Password (to sign out other devices)", className: "text-sm font-semibold mb-2" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "revoke_other_sessions_password",
                type: "password",
                value: sessionForm.data.current_password,
                onChange: (e) => sessionForm.setData("current_password", e.target.value),
                className: "block w-full rounded-xl",
                placeholder: "Enter current password"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: sessionForm.errors.current_password || sessionForm.errors.revoke_other_sessions_password, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", variant: "secondary", disabled: sessionForm.processing || securityAction !== null, className: "w-full sm:w-auto", children: sessionForm.processing || securityAction === "revoke-other-sessions" ? "Signing out..." : "Sign Out Other Devices" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-200 dark:border-gray-700 pt-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold mb-3", children: "Active / Recent Sessions" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            sessions.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No session records available." }),
            sessions.map((session) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: session.is_current ? "Current Device" : "Device Session" }),
                  session.is_current && /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300", children: "Current" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mt-1 break-all", children: session.user_agent || "Unknown browser/device" }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: [
                  "IP: ",
                  session.ip_address || "Unknown",
                  " · Last active: ",
                  new Date(session.last_activity_at).toLocaleString()
                ] })
              ] }),
              !session.is_current && /* @__PURE__ */ jsx(Button, { variant: "danger", onClick: () => revokeSession(session.id), disabled: securityAction !== null, className: "w-full sm:w-auto", children: securityAction === `revoke-session:${session.id}` ? "Revoking..." : "Revoke" })
            ] }, session.id))
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg border-red-200 dark:border-red-800", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-red-500 rounded-xl", children: /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold text-red-900 dark:text-red-100", children: "Delete Account" }),
          /* @__PURE__ */ jsx(CardDescription, { className: "text-red-700 dark:text-red-300", children: "Permanently delete your account and all associated data" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: "Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain." }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "danger",
              type: "button",
              onClick: () => setShowDeleteReview((v) => !v),
              className: "w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50 rounded-xl",
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                showDeleteReview ? "Hide Deletion Review" : "Start Deletion Review"
              ]
            }
          ),
          showDeleteReview && /* @__PURE__ */ jsxs("form", { onSubmit: deleteAccount, className: "rounded-xl border border-red-200 dark:border-red-800 p-4 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("div", { className: `rounded-lg px-3 py-2 text-sm ${deletePrechecks.hasOwnedAccounts ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"}`, children: deletePrechecks.hasOwnedAccounts ? `You own ${ownedAccounts.length} tenant account(s). They will be auto-deleted only if no team members/invites exist.` : "No owned tenant accounts detected." }),
              /* @__PURE__ */ jsx("div", { className: `rounded-lg px-3 py-2 text-sm ${deletePrechecks.hasMemberAccounts ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"}`, children: deletePrechecks.hasMemberAccounts ? `You are still linked to ${memberAccounts.length} tenant account(s) as team member. Leave/remove yourself from all teams before account deletion.` : "No tenant memberships detected." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "delete_account_confirmation_text", value: 'Type "DELETE" to confirm', className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "delete_account_confirmation_text",
                  value: deleteAccountForm.data.confirmation_text,
                  onChange: (e) => deleteAccountForm.setData("confirmation_text", e.target.value),
                  className: "block w-full rounded-xl",
                  placeholder: "DELETE",
                  disabled: deleteBlockedByMemberships
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "delete_account_password", value: "Current Password", className: "text-sm font-semibold mb-2" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "delete_account_password",
                  type: "password",
                  value: deleteAccountForm.data.password,
                  onChange: (e) => deleteAccountForm.setData("password", e.target.value),
                  className: "block w-full rounded-xl",
                  placeholder: "Enter current password",
                  disabled: deleteBlockedByMemberships
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "submit",
                variant: "danger",
                disabled: deleteAccountForm.processing || securityAction !== null || deleteBlockedByMemberships || !deletePrechecks.typedConfirmation || !deletePrechecks.hasPassword,
                className: "w-full sm:w-auto",
                children: deleteAccountForm.processing || securityAction === "delete-account" ? "Deleting..." : "Request Account Deletion"
              }
            )
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SecurityTab as default
};
