import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { B as BrandingWrapper, a as BrandLogo, T as ThemeToggle } from "./BrandingWrapper-CZn0jBQL.js";
import { MessageSquare, Bot, CreditCard, CheckCircle2, Lock, EyeOff, Eye } from "lucide-react";
import { useState } from "react";
import { c as cn } from "./utils-B2ZNUmII.js";
function Guest({ children, headerLabel, headerLinkText, headerLinkHref, compactCard = false }) {
  const setupItems = [
    [MessageSquare, "Connect WhatsApp Cloud API or QR mode"],
    [Bot, "Create sales, support, and handoff automations"],
    [CreditCard, "Prepare Razorpay payment links and billing"],
    [CheckCircle2, "Invite agents and verify notifications"]
  ];
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-white text-waify-text antialiased dark:bg-waify-dark-bg dark:text-waify-dark-text", children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxs("header", { className: "h-16 px-6 sm:px-10 flex items-center justify-between flex-shrink-0", children: [
        /* @__PURE__ */ jsx(Link, { href: route("landing"), className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(BrandLogo, { variant: "auto" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(ThemeToggle, {}),
          headerLinkText && headerLinkHref ? /* @__PURE__ */ jsxs("div", { className: "hidden text-sm text-waify-text-muted dark:text-waify-dark-text-muted sm:block", children: [
            headerLabel,
            " ",
            /* @__PURE__ */ jsx(Link, { href: headerLinkHref, className: "font-semibold text-waify-green-dark hover:underline dark:text-emerald-300", children: headerLinkText })
          ] }) : /* @__PURE__ */ jsx(
            Link,
            {
              href: route("landing"),
              className: "hidden sm:inline-flex text-sm font-semibold text-waify-green-dark hover:underline dark:text-emerald-200",
              children: "Back to website"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center px-6 sm:px-10 py-8", children: /* @__PURE__ */ jsx("div", { className: compactCard ? "w-full max-w-md" : "w-full max-w-md", children }) })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-[480px] xl:w-[560px] flex-shrink-0 bg-waify-ink p-10 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 opacity-[0.06]",
          style: {
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col justify-between text-white w-full", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300", children: "Zyptos workspace" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold leading-tight", children: "Launch your WhatsApp command center with the right setup." }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-white/65", children: "Connect a WABA, invite agents, build automations, and keep billing ready before you start live campaigns." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative my-10 flex justify-center", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-[36px] bg-black p-2 shadow-pop w-72", children: /* @__PURE__ */ jsxs("div", { className: "rounded-[28px] overflow-hidden bg-white", children: [
            /* @__PURE__ */ jsxs("div", { className: "bg-waify-green-darker px-4 py-3 flex items-center gap-3 text-white", children: [
              /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm", children: "Z" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: "Zyptos setup preview" }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/70", children: "ready for onboarding" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 bg-[#ECE5DD] min-h-[280px] flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "self-start bg-white max-w-[85%] px-3 py-2 rounded-tl-md rounded-2xl shadow-sm", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[12px] text-waify-text", children: "Welcome to Zyptos. Connect your WhatsApp number to start testing." }),
                /* @__PURE__ */ jsx("div", { className: "text-[9px] text-right text-gray-400 mt-1", children: "10:24 AM" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "self-end bg-[#DCF8C6] max-w-[80%] px-3 py-2 rounded-tr-md rounded-2xl shadow-sm", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[12px] text-waify-text", children: "I want to set up agents and automation first." }),
                /* @__PURE__ */ jsx("div", { className: "text-[9px] text-right text-gray-500 mt-1", children: "10:31 AM" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "self-center text-[10px] text-gray-600 bg-white/70 rounded px-2 py-0.5 font-medium mt-2", children: "Bot handoff and team assignment ready" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "absolute -top-2 -right-2 bg-white rounded-xl shadow-pop px-3 py-2 text-waify-text", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold", children: "Workspace checklist" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: setupItems.map(([Icon, label]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80", children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-emerald-300" }),
          /* @__PURE__ */ jsx("span", { children: label })
        ] }, label)) })
      ] })
    ] })
  ] }) }) });
}
function AuthDivider({ label }) {
  return /* @__PURE__ */ jsxs("div", { className: "my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: [
    /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-gray-200 dark:bg-slate-700" }),
    label,
    /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-gray-200 dark:bg-slate-700" })
  ] });
}
function SocialAuthButtons({ googleHref, googleEnabled = false }) {
  const className = "surface inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-waify-text ring-1 ring-gray-200 transition hover:bg-gray-50 dark:bg-waify-dark-surface dark:text-waify-dark-text dark:ring-waify-dark-border dark:hover:bg-waify-dark-surface-2";
  if (!googleEnabled || !googleHref) {
    return /* @__PURE__ */ jsxs("button", { type: "button", disabled: true, className: cn(className, "cursor-not-allowed opacity-60"), children: [
      /* @__PURE__ */ jsx(GoogleIcon, {}),
      "Continue with Google"
    ] });
  }
  return /* @__PURE__ */ jsxs("a", { href: googleHref, className, children: [
    /* @__PURE__ */ jsx(GoogleIcon, {}),
    "Continue with Google"
  ] });
}
function AuthField({ label, error, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: label }),
    children,
    error && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-600 dark:text-red-400", children: error })
  ] });
}
function AuthInput({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      className: cn(
        "h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-waify-text outline-none transition placeholder:text-gray-400 focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted",
        className
      ),
      ...props
    }
  );
}
function PasswordField({
  id,
  value,
  onChange,
  label = "Password",
  placeholder,
  autoComplete,
  error,
  forgotHref,
  required = true
}) {
  const [show, setShow] = useState(false);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-1.5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: id, className: "block text-sm font-medium text-waify-text dark:text-waify-dark-text", children: label }),
      forgotHref && /* @__PURE__ */ jsx("a", { href: forgotHref, className: "text-xs font-medium text-waify-green-dark hover:underline dark:text-emerald-300", children: "Forgot password?" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Lock, { className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }),
      /* @__PURE__ */ jsx(
        AuthInput,
        {
          id,
          type: show ? "text" : "password",
          value,
          onChange,
          autoComplete,
          placeholder,
          required,
          className: "pl-10 pr-10"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setShow((current) => !current),
          className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-waify-text dark:hover:text-waify-dark-text",
          "aria-label": show ? "Hide password" : "Show password",
          children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
        }
      )
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-red-600 dark:text-red-400", children: error })
  ] });
}
function AuthCard({ children, className }) {
  return /* @__PURE__ */ jsx("div", { className: cn("w-full max-w-md rounded-card border border-gray-100 bg-white p-7 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface sm:p-10", className), children });
}
function GoogleIcon() {
  return /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 48 48", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx("path", { fill: "#FFC107", d: "M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" }),
    /* @__PURE__ */ jsx("path", { fill: "#FF3D00", d: "m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" }),
    /* @__PURE__ */ jsx("path", { fill: "#4CAF50", d: "M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" }),
    /* @__PURE__ */ jsx("path", { fill: "#1976D2", d: "M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.193 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" })
  ] });
}
export {
  AuthCard as A,
  Guest as G,
  PasswordField as P,
  SocialAuthButtons as S,
  AuthField as a,
  AuthInput as b,
  AuthDivider as c
};
