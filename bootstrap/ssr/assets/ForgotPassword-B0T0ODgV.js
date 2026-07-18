import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { G as Guest, A as AuthCard, a as AuthField, b as AuthInput } from "./AuthParts-C_NCL2pe.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { Lock, CheckCircle, Mail, Send, ArrowLeft } from "lucide-react";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./useToast-BN7qsQL3.js";
function ForgotPassword({ status }) {
  const { data, setData, post, processing, errors } = useForm({
    email: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("password.email"));
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Forgot Password" }),
    /* @__PURE__ */ jsxs(AuthCard, { children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-waify-green/15", children: /* @__PURE__ */ jsx(Lock, { className: "h-7 w-7 text-waify-green-dark" }) }),
      /* @__PURE__ */ jsx("h1", { className: "mt-6 text-center text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: "Forgot your password?" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Enter your work email and we will send a reset link." }),
      status && /* @__PURE__ */ jsxs(Alert, { variant: "success", className: "mt-6", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
        status
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-7 space-y-4", children: [
        /* @__PURE__ */ jsx(AuthField, { label: "Email address", error: errors.email, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
          /* @__PURE__ */ jsx(
            AuthInput,
            {
              id: "email",
              type: "email",
              name: "email",
              value: data.email,
              className: "pl-10",
              autoFocus: true,
              required: true,
              onChange: (e) => setData("email", e.target.value),
              placeholder: "rohan@company.com"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: processing, className: "w-full", children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
          " Send reset link"
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-7 border-t border-gray-100 pt-6 text-center dark:border-slate-700", children: /* @__PURE__ */ jsxs(Link, { href: route("login"), className: "inline-flex items-center gap-1 text-sm font-medium text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        " Back to sign in"
      ] }) })
    ] })
  ] });
}
export {
  ForgotPassword as default
};
