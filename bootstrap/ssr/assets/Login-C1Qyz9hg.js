import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { C as Checkbox } from "./Checkbox-Bd8bJ3HH.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
function Login({
  status,
  canResetPassword
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
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Log in" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Welcome back" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Sign in to your account to continue" })
    ] }),
    status && /* @__PURE__ */ jsxs(Alert, { variant: "success", className: "mb-6", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
      status
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email Address", className: "text-sm font-semibold mb-2" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "email",
              type: "email",
              name: "email",
              value: data.email,
              className: "mt-1 block w-full pl-10 rounded-xl",
              autoComplete: "username",
              isFocused: true,
              onChange: (e) => setData("email", e.target.value),
              placeholder: "you@example.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "Password", className: "text-sm font-semibold mb-2" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "password",
              type: "password",
              name: "password",
              value: data.password,
              className: "mt-1 block w-full pl-10 rounded-xl",
              autoComplete: "current-password",
              onChange: (e) => setData("password", e.target.value),
              placeholder: "Enter your password"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
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
          /* @__PURE__ */ jsx("span", { className: "ms-2 text-sm text-gray-600 dark:text-gray-400", children: "Remember me" })
        ] }),
        canResetPassword && /* @__PURE__ */ jsx(
          Link,
          {
            href: route("password.request"),
            className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
            children: "Forgot password?"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
          children: processing ? "Signing in..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Sign In",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
      "Don't have an account?",
      " ",
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("register"),
          className: "font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
          children: "Sign up"
        }
      )
    ] }) })
  ] });
}
export {
  Login as default
};
