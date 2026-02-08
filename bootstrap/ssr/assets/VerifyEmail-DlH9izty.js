import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { B as Button } from "./Button-ymbdH_NY.js";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { Mail, CheckCircle, Send, LogOut } from "lucide-react";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
function VerifyEmail({ status }) {
  const { post, processing } = useForm({});
  const submit = (e) => {
    e.preventDefault();
    post(route("verification.send"));
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Email Verification" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-4", children: /* @__PURE__ */ jsx(Mail, { className: "h-10 w-10 text-blue-600 dark:text-blue-400" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Verify your email" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?" })
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
          className: "w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
          children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
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
          className: "block w-full text-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4 inline mr-1" }),
            "Log Out"
          ]
        }
      )
    ] })
  ] });
}
export {
  VerifyEmail as default
};
