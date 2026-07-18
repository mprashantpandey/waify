import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { G as Guest, S as SocialAuthButtons, c as AuthDivider, a as AuthField, b as AuthInput, P as PasswordField } from "./AuthParts-C_NCL2pe.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { AlertCircle, Mail, ArrowRight } from "lucide-react";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./useToast-BN7qsQL3.js";
function Checkbox({
  className = "",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      type: "checkbox",
      className: "rounded border-gray-300 text-waify-green shadow-sm focus:ring-waify-green/30 dark:border-waify-dark-border dark:bg-waify-dark-surface " + className
    }
  );
}
function Login({
  status,
  canResetPassword,
  googleOAuthEnabled = false
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password")
    });
  };
  return /* @__PURE__ */ jsxs(Guest, { headerLabel: "New here?", headerLinkText: "Create account", headerLinkHref: route("register"), children: [
    /* @__PURE__ */ jsx(Head, { title: "Log in" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: "Welcome back" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: "Sign in to continue to your Zyptos workspace." })
    ] }),
    status && /* @__PURE__ */ jsxs(Alert, { variant: "success", className: "mb-6", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
      status
    ] }),
    /* @__PURE__ */ jsx(SocialAuthButtons, { googleEnabled: googleOAuthEnabled, googleHref: googleOAuthEnabled ? route("auth.google.redirect") : void 0 }),
    /* @__PURE__ */ jsx(AuthDivider, { label: "Or continue with email" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsx(AuthField, { label: "Work email", error: errors.email, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
        /* @__PURE__ */ jsx(
          AuthInput,
          {
            id: "email",
            type: "email",
            name: "email",
            value: data.email,
            className: "pl-10",
            autoComplete: "username",
            autoFocus: true,
            required: true,
            onChange: (e) => setData("email", e.target.value),
            placeholder: "rohan@company.com"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        PasswordField,
        {
          id: "password",
          value: data.password,
          onChange: (e) => setData("password", e.target.value),
          autoComplete: "current-password",
          placeholder: "Enter your password",
          forgotHref: canResetPassword ? route("password.request") : void 0,
          error: errors.password
        }
      ),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm text-waify-text cursor-pointer select-none dark:text-waify-dark-text", children: [
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            name: "remember",
            checked: data.remember,
            onChange: (e) => setData(
              "remember",
              e.target.checked || false
            )
          }
        ),
        "Keep me signed in for 30 days"
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "w-full h-11",
          children: processing ? "Signing in..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Sign In",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("register"),
            className: "font-semibold text-waify-green-dark hover:underline",
            children: "Sign up"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        "By signing in you agree to our ",
        /* @__PURE__ */ jsx(Link, { href: route("terms"), className: "underline", children: "Terms" }),
        " and ",
        /* @__PURE__ */ jsx(Link, { href: route("privacy"), className: "underline", children: "Privacy Policy" }),
        "."
      ] })
    ] })
  ] });
}
export {
  Login as default
};
