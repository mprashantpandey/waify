import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { G as Guest, A as AuthCard } from "./AuthParts-C_NCL2pe.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { Mail, CheckCircle, Send, LogOut } from "lucide-react";
import { A as Alert } from "./Alert-CEZ-sRON.js";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./useToast-BN7qsQL3.js";
function VerifyEmail({ status }) {
  const { post, processing } = useForm({});
  const submit = (e) => {
    e.preventDefault();
    post(route("verification.send"));
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Email Verification" }),
    /* @__PURE__ */ jsxs(AuthCard, { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-waify-green-soft mb-4", children: /* @__PURE__ */ jsx(Mail, { className: "h-10 w-10 text-waify-green-dark" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text mb-2", children: "Verify your email" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?" })
      ] }),
      status === "verification-link-sent" && /* @__PURE__ */ jsxs(Alert, { variant: "success", className: "mb-6", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Verification link sent!" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm mt-1", children: "A new verification link has been sent to the email address you provided during registration." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "w-full h-11",
            children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
              "Resend Verification Email"
            ] })
          }
        ),
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("logout"),
            method: "post",
            as: "button",
            className: "block w-full text-center text-sm font-medium text-waify-text-muted hover:text-waify-text transition-colors",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 inline mr-1" }),
              "Log Out"
            ]
          }
        )
      ] })
    ] })
  ] });
}
export {
  VerifyEmail as default
};
