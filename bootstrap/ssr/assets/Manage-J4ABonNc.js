import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, useForm, Head } from "@inertiajs/react";
import { Transition } from "@headlessui/react";
import { UserRound, Mail, Briefcase, CheckCircle2, Save, ShieldCheck, KeyRound, Lock, EyeOff, Eye, Smartphone } from "lucide-react";
import { P as PlatformShell } from "./PlatformShell-BDgjSKtX.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputLabel } from "./InputLabel-BMzefKC8.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { s as splitPhoneNumber, t as timezoneForCountryCode, C as CountryPhoneInput } from "./CountryPhoneInput-CHHfMj5w.js";
import { T as TwoFactorSetupPanel } from "./TwoFactorSetupPanel-D-GRENr8.js";
import "axios";
import "./BrandingWrapper-CZn0jBQL.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
import "./Elements-EbyZDnT_.js";
import "./Badge-C65MHc2S.js";
import "qrcode";
function Manage() {
  const { auth, security } = usePage().props;
  const user = auth.user;
  const parsedPhone = splitPhoneNumber(user.phone, user.country_code);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const profileForm = useForm({
    name: user.name || "",
    email: user.email || "",
    country_code: parsedPhone.countryCode,
    phone: parsedPhone.localPhone,
    job_title: user.job_title || "",
    locale: user.locale || "en-IN",
    timezone: user.timezone || timezoneForCountryCode(parsedPhone.countryCode)
  });
  const passwordForm = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const twoFactorForm = useForm({ code: "", password: "" });
  const sessionForm = useForm({ password: "" });
  const updateProfile = (event) => {
    event.preventDefault();
    profileForm.patch(route("profile.update"), {
      preserveScroll: true
    });
  };
  const updatePassword = (event) => {
    event.preventDefault();
    passwordForm.put(route("password.update"), {
      preserveScroll: true,
      onSuccess: () => passwordForm.reset()
    });
  };
  const passwordType = (field) => visiblePasswords[field] ? "text" : "password";
  return /* @__PURE__ */ jsxs(PlatformShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Profile" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-5xl space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(UserRound, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(CardTitle, { children: "Admin profile" }),
              /* @__PURE__ */ jsx(CardDescription, { children: "Update the login identity used for platform administration." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: updateProfile, className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Full name", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(UserRound, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "name",
                      value: profileForm.data.name,
                      onChange: (event) => profileForm.setData("name", event.target.value),
                      className: "block h-10 w-full rounded-btn border-gray-200 pl-9 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: profileForm.errors.name, className: "mt-2 text-xs" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email address", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "email",
                      type: "email",
                      value: profileForm.data.email,
                      onChange: (event) => profileForm.setData("email", event.target.value),
                      className: "block h-10 w-full rounded-btn border-gray-200 pl-9 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
                      required: true
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: profileForm.errors.email, className: "mt-2 text-xs" })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              CountryPhoneInput,
              {
                countryCode: profileForm.data.country_code,
                phone: profileForm.data.phone,
                onCountryCodeChange: (value) => profileForm.setData((current) => ({ ...current, country_code: value, timezone: timezoneForCountryCode(value) })),
                onPhoneChange: (value) => profileForm.setData("phone", value),
                error: profileForm.errors.phone || profileForm.errors.country_code
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "job_title", value: "Role / title", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(Briefcase, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "job_title",
                      value: profileForm.data.job_title,
                      onChange: (event) => profileForm.setData("job_title", event.target.value),
                      className: "block h-10 w-full rounded-btn border-gray-200 pl-9 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
                      placeholder: "Platform owner"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: profileForm.errors.job_title, className: "mt-2 text-xs" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { htmlFor: "locale", value: "Language", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
                /* @__PURE__ */ jsxs(
                  "select",
                  {
                    id: "locale",
                    value: profileForm.data.locale,
                    onChange: (event) => profileForm.setData("locale", event.target.value),
                    className: "h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "en-IN", children: "English (India)" }),
                      /* @__PURE__ */ jsx("option", { value: "en-US", children: "English (US)" }),
                      /* @__PURE__ */ jsx("option", { value: "hi-IN", children: "Hindi" }),
                      /* @__PURE__ */ jsx("option", { value: "ta-IN", children: "Tamil" }),
                      /* @__PURE__ */ jsx("option", { value: "te-IN", children: "Telugu" }),
                      /* @__PURE__ */ jsx("option", { value: "mr-IN", children: "Marathi" }),
                      /* @__PURE__ */ jsx("option", { value: "bn-IN", children: "Bengali" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: profileForm.errors.locale, className: "mt-2 text-xs" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 border-t border-gray-100 pt-4 dark:border-slate-700", children: [
              /* @__PURE__ */ jsx(Transition, { show: profileForm.recentlySuccessful, enter: "transition ease-in-out", enterFrom: "opacity-0", leave: "transition ease-in-out", leaveTo: "opacity-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
                "Saved"
              ] }) }),
              /* @__PURE__ */ jsx(Button, { type: "submit", disabled: profileForm.processing, children: profileForm.processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                "Save profile"
              ] }) })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Super admin access" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "This account can manage platform settings, billing, users, plans, and support operations." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(Card, { className: "p-5", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Login email" }),
            /* @__PURE__ */ jsx("div", { className: "mt-1 break-all text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: user.email })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(KeyRound, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Password" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Change the password used to sign in to the admin panel." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: updatePassword, className: "space-y-5", children: [
          /* @__PURE__ */ jsx("div", { className: "grid gap-5 md:grid-cols-3", children: [
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
                  type: passwordType(field),
                  value: passwordForm.data[field],
                  onChange: (event) => passwordForm.setData(field, event.target.value),
                  className: "block h-10 w-full rounded-btn border-gray-200 pl-9 pr-10 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
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
            /* @__PURE__ */ jsx(InputError, { message: passwordForm.errors[field], className: "mt-2 text-xs" })
          ] }, field)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 border-t border-gray-100 pt-4 dark:border-slate-700", children: [
            /* @__PURE__ */ jsx(Transition, { show: passwordForm.recentlySuccessful, enter: "transition ease-in-out", enterFrom: "opacity-0", leave: "transition ease-in-out", leaveTo: "opacity-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
              "Updated"
            ] }) }),
            /* @__PURE__ */ jsx(Button, { type: "submit", disabled: passwordForm.processing, children: passwordForm.processing ? "Updating..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
              "Update password"
            ] }) })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Security" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Protect this admin login with 2FA and session controls." })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-5", children: [
          user.two_factor_enabled ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx("div", { className: "rounded-card border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200", children: "2FA is enabled." }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
              /* @__PURE__ */ jsx(TextInput, { type: "password", value: twoFactorForm.data.password, onChange: (event) => twoFactorForm.setData("password", event.target.value), placeholder: "Current password", className: "h-10 flex-1" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "danger", onClick: () => twoFactorForm.delete(route("two-factor.disable"), { preserveScroll: true }), disabled: !twoFactorForm.data.password || twoFactorForm.processing, children: "Disable 2FA" })
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: twoFactorForm.errors.password, className: "text-xs" })
          ] }) : security?.two_factor_setup ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsx(TwoFactorSetupPanel, { setup: security.two_factor_setup }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row", children: [
              /* @__PURE__ */ jsx(TextInput, { value: twoFactorForm.data.code, onChange: (event) => twoFactorForm.setData("code", event.target.value), placeholder: "6-digit code", className: "h-10 flex-1 font-mono", inputMode: "numeric" }),
              /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => twoFactorForm.post(route("two-factor.enable"), { preserveScroll: true }), disabled: twoFactorForm.data.code.length < 6 || twoFactorForm.processing, children: "Verify & enable" })
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: twoFactorForm.errors.code, className: "text-xs" })
          ] }) : /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => twoFactorForm.post(route("two-factor.prepare"), { preserveScroll: true }), children: [
            /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4" }),
            "Start 2FA setup"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-100 pt-5 dark:border-slate-700", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Active sessions" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (security?.sessions || []).map((session) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-card border border-gray-100 p-3 text-sm dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: [
                  session.ip_address || "Unknown IP",
                  " ",
                  session.is_current ? "(current)" : ""
                ] }),
                /* @__PURE__ */ jsx("div", { className: "truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: session.user_agent || "Unknown device" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "shrink-0 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: new Date(session.last_activity).toLocaleString() })
            ] }, session.id)) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-2 sm:flex-row", children: [
              /* @__PURE__ */ jsx(TextInput, { type: "password", value: sessionForm.data.password, onChange: (event) => sessionForm.setData("password", event.target.value), placeholder: "Current password", className: "h-10 flex-1" }),
              /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: () => sessionForm.delete(route("profile.sessions.destroy-others"), { preserveScroll: true }), disabled: !sessionForm.data.password || sessionForm.processing, children: "Revoke other sessions" })
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: sessionForm.errors.password, className: "mt-2 text-xs" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  Manage as default
};
