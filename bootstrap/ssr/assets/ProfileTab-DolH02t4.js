import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { usePage, useForm } from "@inertiajs/react";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputLabel } from "./InputLabel-BMzefKC8.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { User, Mail, Briefcase, Save, CheckCircle2 } from "lucide-react";
import { Transition } from "@headlessui/react";
import { s as splitPhoneNumber, t as timezoneForCountryCode, C as CountryPhoneInput } from "./CountryPhoneInput-CHHfMj5w.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function ProfileTab() {
  const { auth } = usePage().props;
  const user = auth?.user;
  const parsedPhone = splitPhoneNumber(user?.phone, user?.country_code);
  const { data, setData, patch, processing, errors, reset, recentlySuccessful } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    country_code: parsedPhone.countryCode,
    phone: parsedPhone.localPhone,
    job_title: user?.job_title || "",
    locale: user?.locale || "en-IN",
    timezone: user?.timezone || timezoneForCountryCode(parsedPhone.countryCode)
  });
  const submit = (e) => {
    e.preventDefault();
    patch(route("profile.update"), {
      preserveScroll: true,
      onSuccess: () => reset()
    });
  };
  return /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsx(Card, { className: "p-5", children: /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Full name", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "name",
            type: "text",
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            className: "block h-9 w-full rounded-btn border-gray-200 pl-9 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2 text-xs" })
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
            value: data.email,
            onChange: (e) => setData("email", e.target.value),
            className: "block h-9 w-full rounded-btn border-gray-200 pl-9 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2 text-xs" })
    ] }),
    /* @__PURE__ */ jsx(
      CountryPhoneInput,
      {
        countryCode: data.country_code,
        phone: data.phone,
        onCountryCodeChange: (value) => setData((current) => ({ ...current, country_code: value, timezone: timezoneForCountryCode(value) })),
        onPhoneChange: (value) => setData("phone", value),
        error: errors.phone || errors.country_code
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-5 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "job_title", value: "Role / title", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Briefcase, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
          /* @__PURE__ */ jsx(TextInput, { id: "job_title", value: data.job_title, onChange: (e) => setData("job_title", e.target.value), className: "block h-9 w-full rounded-btn border-gray-200 pl-9 text-sm focus:border-waify-green focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900", placeholder: "Marketing manager" })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.job_title, className: "mt-2 text-xs" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "locale", value: "Language", className: "mb-1 text-xs font-medium text-waify-text dark:text-waify-dark-text" }),
        /* @__PURE__ */ jsxs("select", { id: "locale", value: data.locale, onChange: (e) => setData("locale", e.target.value), className: "h-9 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-600 dark:bg-slate-900 dark:text-waify-dark-text", children: [
          /* @__PURE__ */ jsx("option", { value: "en-IN", children: "English (India)" }),
          /* @__PURE__ */ jsx("option", { value: "en-US", children: "English (US)" }),
          /* @__PURE__ */ jsx("option", { value: "hi-IN", children: "Hindi" }),
          /* @__PURE__ */ jsx("option", { value: "ta-IN", children: "Tamil" }),
          /* @__PURE__ */ jsx("option", { value: "te-IN", children: "Telugu" }),
          /* @__PURE__ */ jsx("option", { value: "mr-IN", children: "Marathi" }),
          /* @__PURE__ */ jsx("option", { value: "bn-IN", children: "Bengali" })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.locale, className: "mt-2 text-xs" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4 border-t border-gray-100 pt-4 dark:border-slate-700", children: [
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, children: processing ? "Saving..." : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
        "Save changes"
      ] }) }),
      /* @__PURE__ */ jsx(
        Transition,
        {
          show: recentlySuccessful,
          enter: "transition ease-in-out",
          enterFrom: "opacity-0",
          leave: "transition ease-in-out",
          leaveTo: "opacity-0",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
            "Saved"
          ] })
        }
      )
    ] })
  ] }) }) });
}
export {
  ProfileTab as default
};
