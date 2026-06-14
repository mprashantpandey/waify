import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { G as Guest, A as AuthCard, P as PasswordField } from "./AuthParts-Ci55wM4z.js";
import { useForm, Head } from "@inertiajs/react";
import { Shield, ArrowRight } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./useToast-BN7qsQL3.js";
function ConfirmPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    password: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("password.confirm"), {
      onFinish: () => reset("password")
    });
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Confirm Password" }),
    /* @__PURE__ */ jsxs(AuthCard, { children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-waify-green-soft mb-4", children: /* @__PURE__ */ jsx(Shield, { className: "h-10 w-10 text-waify-green-dark" }) }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text mb-2", children: "Confirm password" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "This is a secure area of the application. Please confirm your password before continuing." })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
        /* @__PURE__ */ jsx(PasswordField, { id: "password", value: data.password, onChange: (e) => setData("password", e.target.value), placeholder: "Enter your password", error: errors.password }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: processing,
            className: "w-full h-11",
            children: processing ? "Confirming..." : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Confirm Password",
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ] })
          }
        )
      ] })
    ] })
  ] });
}
export {
  ConfirmPassword as default
};
