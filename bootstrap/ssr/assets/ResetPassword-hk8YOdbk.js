import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { G as Guest, A as AuthCard, a as AuthField, b as AuthInput, P as PasswordField } from "./AuthParts-Ci55wM4z.js";
import { useForm, Head } from "@inertiajs/react";
import { Mail, Check } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
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
    /* @__PURE__ */ jsxs(AuthCard, { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-center text-2xl font-bold text-waify-text dark:text-waify-dark-text", children: "Set a new password" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Must be at least 8 characters with one number." }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-7 space-y-4", children: [
        /* @__PURE__ */ jsx(AuthField, { label: "Work email", error: errors.email, children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsx(
            AuthInput,
            {
              id: "email",
              type: "email",
              name: "email",
              value: data.email,
              className: "bg-gray-50 pl-10 dark:bg-waify-dark-surface-2",
              autoComplete: "username",
              onChange: (e) => setData("email", e.target.value),
              disabled: true
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(PasswordField, { id: "password", label: "New password", value: data.password, autoComplete: "new-password", placeholder: "Enter new password", onChange: (e) => setData("password", e.target.value), error: errors.password }),
        /* @__PURE__ */ jsx(PasswordField, { id: "password_confirmation", label: "Confirm password", value: data.password_confirmation, autoComplete: "new-password", placeholder: "Confirm new password", onChange: (e) => setData("password_confirmation", e.target.value), error: errors.password_confirmation }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "w-full",
            children: processing ? "Resetting..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
              " Update password"
            ] })
          }
        )
      ] })
    ] })
  ] });
}
export {
  ResetPassword as default
};
