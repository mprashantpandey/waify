import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { useForm, Head } from "@inertiajs/react";
import { Mail, Lock, Shield, ArrowRight } from "lucide-react";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
function ResetPassword({
  token,
  email
}) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token,
    email,
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("password.store"), {
      onFinish: () => reset("password", "password_confirmation")
    });
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Reset Password" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Reset your password" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "Enter your new password below" })
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
              onChange: (e) => setData("email", e.target.value),
              disabled: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
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
              name: "password",
              value: data.password,
              className: "mt-1 block w-full pl-10 rounded-xl",
              autoComplete: "new-password",
              isFocused: true,
              onChange: (e) => setData("password", e.target.value),
              placeholder: "Enter new password"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          InputLabel,
          {
            htmlFor: "password_confirmation",
            value: "Confirm Password",
            className: "text-sm font-semibold mb-2"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Shield, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "password",
              name: "password_confirmation",
              value: data.password_confirmation,
              className: "mt-1 block w-full pl-10 rounded-xl",
              autoComplete: "new-password",
              onChange: (e) => setData("password_confirmation", e.target.value),
              placeholder: "Confirm new password"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          InputError,
          {
            message: errors.password_confirmation,
            className: "mt-2"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl",
          children: processing ? "Resetting..." : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Reset Password",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ] })
        }
      )
    ] })
  ] });
}
export {
  ResetPassword as default
};
