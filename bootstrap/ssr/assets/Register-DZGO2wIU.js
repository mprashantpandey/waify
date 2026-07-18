import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { G as Guest, S as SocialAuthButtons, c as AuthDivider, a as AuthField, b as AuthInput, P as PasswordField } from "./AuthParts-C_NCL2pe.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { Star, Mail, Sparkles, ArrowRight } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "react";
import "./useToast-BN7qsQL3.js";
function Register({
  selectedPlan,
  invite,
  googleOAuthEnabled = false
}) {
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
    if (amount === 0) return "₹0";
    const major = amount / 100;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0
    }).format(major);
  };
  const googleSignupHref = googleOAuthEnabled ? route("auth.google.redirect", {
    intent: "signup",
    ...selectedPlan?.key ? { plan: selectedPlan.key } : {},
    ...invite?.token ? { invite: invite.token } : {}
  }) : void 0;
  return /* @__PURE__ */ jsxs(Guest, { headerLabel: "Already have an account?", headerLinkText: "Sign in", headerLinkHref: route("login"), children: [
    /* @__PURE__ */ jsx(Head, { title: "Create Your Account" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text", children: invite?.account_name ? `Join ${invite.account_name}` : selectedPlan ? `Start Your ${selectedPlan.trial_days > 0 ? selectedPlan.trial_days + "-Day " : ""}Trial` : "Start your Zyptos trial" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: invite?.account_name ? `You've been invited as a ${invite.role || "member"}. Create your account to join the team.` : selectedPlan ? `Get started with ${selectedPlan.name} plan. ${selectedPlan.trial_days > 0 ? "No credit card required!" : ""}` : "Choose a paid plan with a trial window. Cancel anytime." })
    ] }),
    selectedPlan && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-xl border border-waify-green/20 bg-waify-green-soft p-4 dark:bg-waify-dark-green-soft", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsxs("h3", { className: "font-semibold text-gray-900 dark:text-gray-100", children: [
            selectedPlan.name,
            " Plan"
          ] }),
          selectedPlan.trial_days > 0 && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 bg-white text-waify-green-dark text-xs font-bold rounded-full", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-3 w-3" }),
            selectedPlan.trial_days,
            "-Day Trial"
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-waify-text-muted", children: selectedPlan.description }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-waify-text mt-1", children: [
          formatPrice(selectedPlan.price_monthly),
          "/month",
          selectedPlan.trial_days > 0 && /* @__PURE__ */ jsxs("span", { className: "text-waify-green-dark ml-2", children: [
            "- Free for ",
            selectedPlan.trial_days,
            " days"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("pricing"),
          className: "text-xs text-waify-green-dark hover:underline",
          children: "Change Plan"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(SocialAuthButtons, { googleEnabled: googleOAuthEnabled, googleHref: googleSignupHref }),
    /* @__PURE__ */ jsx(AuthDivider, { label: "Or sign up with email" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
      /* @__PURE__ */ jsx(AuthField, { label: "Full name", error: errors.name, children: /* @__PURE__ */ jsx(
        AuthInput,
        {
          id: "name",
          name: "name",
          value: data.name,
          autoComplete: "name",
          autoFocus: true,
          onChange: (e) => setData("name", e.target.value),
          placeholder: "Rohan Mehta",
          required: true
        }
      ) }),
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
            onChange: (e) => setData("email", e.target.value),
            placeholder: "rohan@company.com",
            required: true,
            readOnly: Boolean(invite?.email)
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(
        PasswordField,
        {
          id: "password",
          label: "Create password",
          value: data.password,
          onChange: (e) => setData("password", e.target.value),
          autoComplete: "new-password",
          placeholder: "At least 8 characters",
          error: errors.password
        }
      ),
      /* @__PURE__ */ jsx(
        PasswordField,
        {
          id: "password_confirmation",
          label: "Confirm password",
          value: data.password_confirmation,
          onChange: (e) => setData("password_confirmation", e.target.value),
          autoComplete: "new-password",
          placeholder: "Confirm your password",
          error: errors.password_confirmation
        }
      ),
      /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-0.5 h-4 w-4 rounded accent-waify-green", required: true }),
        "I agree to the Terms and Privacy Policy and consent to WhatsApp Business API onboarding."
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          disabled: processing,
          className: "w-full h-11",
          children: processing ? "Creating account..." : /* @__PURE__ */ jsx(Fragment, { children: (selectedPlan?.trial_days ?? 0) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            "Start Free Trial",
            /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            "Create Account",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center space-y-2", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("login"),
            className: "font-semibold text-waify-green-dark hover:underline",
            children: "Sign in"
          }
        )
      ] }),
      selectedPlan && /* @__PURE__ */ jsxs("p", { className: "text-xs text-waify-text-muted", children: [
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
