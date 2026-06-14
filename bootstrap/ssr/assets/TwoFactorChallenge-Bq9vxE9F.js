import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head } from "@inertiajs/react";
import { ShieldCheck } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import { T as TextInput } from "./TextInput-CmkZX80k.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function TwoFactorChallenge() {
  const form = useForm({ code: "" });
  const submit = (event) => {
    event.preventDefault();
    form.post(route("two-factor.verify"));
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen items-center justify-center bg-waify-bg px-4 dark:bg-slate-950", children: [
    /* @__PURE__ */ jsx(Head, { title: "Two-factor verification" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md rounded-card border border-gray-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: "Two-factor verification" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Enter the 6-digit code from your authenticator app." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: form.data.code,
              onChange: (event) => form.setData("code", event.target.value),
              className: "h-11 w-full text-center font-mono text-lg tracking-[0.4em]",
              autoFocus: true,
              inputMode: "numeric",
              maxLength: 12
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: form.errors.code, className: "mt-2 text-xs" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: form.processing || form.data.code.length < 6, children: "Verify" })
      ] })
    ] })
  ] });
}
export {
  TwoFactorChallenge as default
};
