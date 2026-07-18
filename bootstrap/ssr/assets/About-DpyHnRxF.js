import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { Zap, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { f as MarketingLayout } from "./Marketing-DVQdzdv4.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import "react";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./ProviderLogo-1eHVtujo.js";
function About() {
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "about", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "About" }),
    /* @__PURE__ */ jsxs(Card, { className: "p-6 sm:p-8", children: [
      /* @__PURE__ */ jsx("p", { className: "max-w-3xl text-lg leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Zyptos helps teams operate WhatsApp from a workspace-first dashboard: one WABA connection per workspace, shared inbox, campaigns, templates, automations, AI agents, Meta Leads, Google integrations, and GST-ready billing." }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-4", children: [
        ["Workspace-first", "Separate users, contacts, billing, automations, and permissions by workspace."],
        ["One WABA", "Each workspace connects one WhatsApp Business number for clean routing."],
        ["Automation ready", "Use visual flows, AI-agent nodes, handoff, test mode, and run history."],
        ["Billing ready", "Use bank/UPI or Razorpay one-time payments with GST invoice PDFs."]
      ].map(([title, body]) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-gray-100 p-4 text-left dark:border-slate-800", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-waify-text dark:text-waify-dark-text", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-relaxed text-waify-text-muted", children: body })
      ] }, title)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-4 md:grid-cols-3", children: [
      [Zap, "Operations first", "Every screen is designed for repeated campaign, inbox, and billing work."],
      [ShieldCheck, "Meta-ready", "Embedded signup, webhook checks, WABA diagnostics, template sync, and lead-form sync are first-class."],
      [Users, "Workspace aware", "Users, roles, billing, settings, activity, and admin visibility stay properly separated."]
    ].map(([Icon, title, body]) => /* @__PURE__ */ jsxs(Card, { className: "mkt-card-lift p-5", children: [
      /* @__PURE__ */ jsx(Icon, { className: "mb-4 h-6 w-6 text-waify-green-dark" }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
    ] }, title)) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col gap-3 sm:flex-row", children: [
      /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsxs(Button, { children: [
        /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" }),
        " Start free"
      ] }) }),
      /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Contact us" }) })
    ] })
  ] });
}
export {
  About as default
};
