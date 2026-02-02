import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { G as Guest } from "./GuestLayout-D8lrkWRg.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { Star, User, Mail, Lock, Sparkles, ArrowRight } from "lucide-react";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./BrandingWrapper-B2Mh0bYb.js";
function Register({ selectedPlan, invite }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: invite?.email || "",
    password: "",
    password_confirmation: "",
    plan_key: selectedPlan?.key || "",
    invite_token: invite?.token || ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation")
    });
  };
  const formatPrice = (amount) => {
    if (amount === 0) return "Free";
    const major = amount / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(major);
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Your Account" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2", children: invite?.workspace_name ? `Join ${invite.workspace_name}` : selectedPlan ? `Start Your ${selectedPlan.trial_days > 0 ? selectedPlan.trial_days + "-Day " : ""}Trial` : "Create your account" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: invite?.workspace_name ? `You've been invited as a ${invite.role || "member"}. Create your account to join the workspace.` : selectedPlan ? `Get started with ${selectedPlan.name} plan. ${selectedPlan.trial_days > 0 ? "No credit card required!" : ""}` : "Get started with your free account today" })
    ] }),
    selectedPlan && /* @__PURE__ */ jsx("div", { className: "mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
            selectedPlan.name,
            " Plan"
          ] }),
          selectedPlan.trial_days > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-3 w-3" }),
            selectedPlan.trial_days,
            "-Day Trial"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: selectedPlan.description }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1", children: [
          formatPrice(selectedPlan.price_monthly),
          "/month",
          selectedPlan.trial_days > 0 && /* @__PURE__ */ jsxs("span", { className: "text-green-600 dark:text-green-400 ml-2", children: [
            "• Free for ",
            selectedPlan.trial_days,
            " days"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("pricing"),
          className: "text-xs text-blue-600 dark:text-blue-400 hover:underline",
          children: "Change Plan"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Full Name", className: "text-sm font-semibold mb-2" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "name",
              name: "name",
              value: data.name,
              className: "mt-1 block w-full pl-10 rounded-xl",
              autoComplete: "name",
              isFocused: true,
              onChange: (e) => setData("name", e.target.value),
              placeholder: "John Doe",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
      ] }),
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
              placeholder: "you@example.com",
              required: true,
              readOnly: Boolean(invite?.email)
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
              autoComplete: "new-password",
              onChange: (e) => setData("password", e.target.value),
              placeholder: "Create a strong password",
              required: true
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
          /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "password_confirmation",
              type: "password",
              name: "password_confirmation",
              value: data.password_confirmation,
              className: "mt-1 block w-full pl-10 rounded-xl",
              autoComplete: "new-password",
              onChange: (e) => setData("password_confirmation", e.target.value),
              placeholder: "Confirm your password",
              required: true
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
          children: processing ? "Creating account..." : /* @__PURE__ */ jsx(Fragment, { children: (selectedPlan?.trial_days ?? 0) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            "Start Free Trial",
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 ml-2" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Create Account",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2" })
          ] }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center space-y-2", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("login"),
            className: "font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
            children: "Sign in"
          }
        )
      ] }),
      selectedPlan && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
        "By signing up, you agree to our",
        " ",
        /* @__PURE__ */ jsx(Link, { href: route("terms"), className: "underline", children: "Terms of Service" }),
        " ",
        "and",
        " ",
        /* @__PURE__ */ jsx(Link, { href: route("privacy"), className: "underline", children: "Privacy Policy" })
      ] })
    ] })
  ] });
}
export {
  Register as default
};
