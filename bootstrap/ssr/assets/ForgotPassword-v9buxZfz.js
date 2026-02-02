import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { CheckCircle, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { A as Alert } from "./Alert-D7z82-LQ.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
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
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Reset your password" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Enter your email address and we'll send you a link to reset your password." })
    ] }),
    status && /* @__PURE__ */ jsxs(Alert, { variant: "success", className: "mb-6", children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4" }),
      status
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "email",
              type: "email",
              name: "email",
              value: data.email,
              className: "block w-full pl-10 rounded-xl",
              isFocused: true,
              onChange: (e) => setData("email", e.target.value),
              placeholder: "you@example.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
          children: processing ? "Sending..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Send Reset Link",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs(
      Link,
      {
        href: route("login"),
        className: "inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
          "Back to login"
        ]
      }
    ) })
  ] });
}
export {
  ForgotPassword as default
};
