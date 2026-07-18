import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { S as SeoHead, M as MarketingSiteNav, a as MarketingIcon, b as MarketingLogoCloud, P as ProductPreview, i as integrations, c as MarketingFaqAccordion, m as marketingFaq, d as MarketingSiteFooter, e as MarketingWhatsAppFloater, A as Avatar } from "./Marketing-DVQdzdv4.js";
import { P as ProviderLogo } from "./ProviderLogo-1eHVtujo.js";
import { B as BrandingWrapper } from "./BrandingWrapper-DdVUILzh.js";
import { C as CookieConsentBanner, A as AnalyticsScripts } from "./CookieConsentBanner-X10ew4Dy.js";
import { Sparkles, CheckCircle, Check, Inbox, Bot, BarChart2, Zap, Megaphone, Users, Workflow, TrendingUp, MessageCircle } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import "./BrandLogo-TeztHB0m.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./Card-BtIXZ0GS.js";
import "./useToast-BN7qsQL3.js";
const features = [
  { icon: "megaphone", title: "Broadcast campaigns", desc: "Segment contacts, schedule template campaigns, retry failed recipients, and track delivery in real time." },
  { icon: "workflow", title: "Automation flows", desc: "Build deterministic journeys with branches, waits, tags, assignments, webhooks, and AI-agent handoff." },
  { icon: "message-circle", title: "Shared team inbox", desc: "Assign chats, add notes, quick replies, bot controls, and call history — all from one inbox." },
  { icon: "file-text", title: "Template manager", desc: "Create, submit, and monitor Meta template approvals directly from your dashboard." },
  { icon: "target", title: "Meta Leads", desc: "Connect lead forms, map fields, auto-tag contacts, alert your team, and start follow-up flows." },
  { icon: "credit-card", title: "Payments and invoices", desc: "Create invoices, collect Razorpay or bank/UPI payments, apply discounts, and track payment status." }
];
function Landing({ stats, plans = [], canRegister = true, seo }) {
  const [annual, setAnnual] = useState(false);
  const [productTab, setProductTab] = useState("campaigns");
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return () => window.clearTimeout(timer);
  }, []);
  const displayPlans = plans.filter((plan) => plan.key !== "enterprise" && plan.key !== "free").slice(0, 3);
  const formatPrice = (amount, currency = "INR") => amount === 0 ? "₹0" : new Intl.NumberFormat("en-IN", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount / 100);
  return /* @__PURE__ */ jsxs(BrandingWrapper, { children: [
    /* @__PURE__ */ jsx(SeoHead, { seo }),
    /* @__PURE__ */ jsxs("div", { className: "min-h-screen overflow-x-hidden bg-white text-waify-text dark:bg-slate-900 dark:text-waify-dark-text", children: [
      /* @__PURE__ */ jsx(MarketingSiteNav, { currentPage: "home" }),
      /* @__PURE__ */ jsxs("header", { className: "relative overflow-hidden bg-waify-ink pb-20 pt-28 sm:pb-28 sm:pt-36", children: [
        /* @__PURE__ */ jsxs("div", { className: "pointer-events-none absolute inset-0", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-[-10%] top-[-5%] h-[500px] w-[500px] rounded-full bg-waify-green/25 blur-[120px]" }),
          /* @__PURE__ */ jsx("div", { className: "absolute right-[-5%] top-[20%] h-[400px] w-[400px] rounded-full bg-emerald-500/15 blur-[100px]" }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-10%] left-[40%] h-[300px] w-[300px] rounded-full bg-waify-green/10 blur-[80px]" })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute inset-0 opacity-20",
            style: {
              backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "40px 40px"
            }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center lg:text-left", children: [
            /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-waify-green/30 bg-waify-green/10 px-3 py-1.5 text-xs font-semibold text-emerald-400", children: [
              /* @__PURE__ */ jsx(Sparkles, { size: 12 }),
              " AI agents · Automations · Team inbox"
            ] }),
            /* @__PURE__ */ jsxs("h1", { className: "mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-[3.25rem]", children: [
              "Run WhatsApp sales,",
              " ",
              /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-emerald-400 to-waify-green bg-clip-text text-transparent", children: "support & campaigns" }),
              " ",
              "from one workspace"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0", children: "Connect your WABA, manage contacts and templates, automate replies, assign chats, and collect payments — all from one platform." }),
            /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start", children: [
              canRegister && /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsxs(Button, { size: "xl", className: "w-full shadow-lg shadow-waify-green/25 sm:w-auto", children: [
                /* @__PURE__ */ jsx(MarketingIcon, { name: "rocket", size: 18 }),
                " Start free — no credit card"
              ] }) }),
              /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsxs(Button, { size: "xl", variant: "secondary", className: "w-full border-white/10 bg-white/8 text-white ring-white/20 hover:bg-white/12 sm:w-auto", children: [
                /* @__PURE__ */ jsx(MarketingIcon, { name: "play-circle", size: 18 }),
                " Book a demo"
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-500 lg:justify-start", children: ["14-day free trial", "No credit card required", "Cancel anytime"].map((item) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(CheckCircle, { size: 13, className: "text-waify-green" }),
              " ",
              item
            ] }, item)) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "relative hidden md:block", children: /* @__PURE__ */ jsx(HeroDashboard, {}) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(MarketingLogoCloud, {}),
      /* @__PURE__ */ jsx("section", { id: "features", className: "bg-gray-50/80 py-20 dark:bg-slate-950 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx(
          SectionHeading,
          {
            eyebrow: "Platform",
            title: "Everything you need to grow on WhatsApp",
            body: "From first broadcast to automated journeys — built for D2C brands, agencies, and SMBs."
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: features.map((feature, i) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "group mkt-card-lift relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900",
            children: [
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-waify-green/0 to-waify-green/0 opacity-0 transition duration-300 group-hover:from-waify-green/3 group-hover:to-emerald-500/5 group-hover:opacity-100" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-waify-green/10 transition group-hover:bg-waify-green/15", children: /* @__PURE__ */ jsx(MarketingIcon, { name: feature.icon, size: 22, className: "text-waify-green-dark" }) }),
                /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-waify-text dark:text-waify-dark-text", children: feature.title }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: feature.desc })
              ] })
            ]
          },
          feature.title
        )) }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 flex flex-wrap justify-center gap-2", children: ["WhatsApp Cloud API", "QR unofficial mode", "Meta Lead Forms", "Google Sheets sync", "Razorpay payments", "AI agent nodes", "Broadcast campaigns", "Team assignments", "Contact segments"].map((cap) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-waify-text-muted dark:border-slate-700 dark:bg-slate-900", children: [
          /* @__PURE__ */ jsx(Check, { size: 11, className: "text-waify-green" }),
          " ",
          cap
        ] }, cap)) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "product", className: "py-20 sm:py-24", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid items-center gap-12 lg:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-waify-green-dark", children: "Product tour" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-2 text-3xl font-bold tracking-tight sm:text-4xl", children: "See Zyptos in action" }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Campaign analytics, shared team inbox, visual automations, workspace billing, and Meta diagnostics — designed as one operating system for WhatsApp." }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: [
            { id: "campaigns", label: "Campaigns", icon: "megaphone" },
            { id: "inbox", label: "Inbox", icon: "message-circle" },
            { id: "automation", label: "Automation", icon: "workflow" }
          ].map((tab) => /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => setProductTab(tab.id),
              className: `inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium ring-1 transition ${productTab === tab.id ? "bg-waify-green text-white ring-waify-green" : "bg-white text-waify-text-muted ring-gray-200 hover:ring-waify-green/40 dark:bg-slate-800 dark:ring-slate-600"}`,
              children: [
                /* @__PURE__ */ jsx(MarketingIcon, { name: tab.icon, size: 16 }),
                " ",
                tab.label
              ]
            },
            tab.id
          )) }),
          /* @__PURE__ */ jsx(Link, { href: route("app.dashboard"), children: /* @__PURE__ */ jsxs(Button, { className: "mt-8", variant: "secondary", children: [
            /* @__PURE__ */ jsx(MarketingIcon, { name: "layout-dashboard", size: 18 }),
            " Explore live dashboard"
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(ProductPreview, { children: renderProductPanel(productTab) })
      ] }) }) }),
      /* @__PURE__ */ jsx("section", { id: "how", className: "bg-gray-50/80 py-20 dark:bg-slate-950 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx(SectionHeading, { title: "Up and running in minutes", body: "Connect a WABA, import contacts, create templates, and launch your first campaign — all from one wizard." }),
        /* @__PURE__ */ jsx("div", { className: "mt-14 grid gap-0 sm:grid-cols-2 lg:grid-cols-4", children: [
          { icon: /* @__PURE__ */ jsx(MarketingIcon, { name: "link-2", size: 20, className: "text-waify-green-dark" }), step: "01", title: "Connect WhatsApp", desc: "Meta Cloud API embedded signup, coexistence, or QR mode. Full diagnostic health check included." },
          { icon: /* @__PURE__ */ jsx(MarketingIcon, { name: "users", size: 20, className: "text-waify-green-dark" }), step: "02", title: "Import audience", desc: "CSV import, Meta Leads, form submissions, tags, segments, and full contact profiles." },
          { icon: /* @__PURE__ */ jsx(MarketingIcon, { name: "file-check", size: 20, className: "text-waify-green-dark" }), step: "03", title: "Build templates", desc: "Submit to Meta, monitor approval status, and manage variables and buttons in one place." },
          { icon: /* @__PURE__ */ jsx(MarketingIcon, { name: "send", size: 20, className: "text-waify-green-dark" }), step: "04", title: "Launch and measure", desc: "Track queued, sent, delivered, failed, replies, bot status, and handoff events in real time." }
        ].map(({ icon, step, title, desc }, index) => /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center px-6 py-8 text-center", children: [
          index < 3 && /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-12 hidden h-px w-1/2 lg:block", children: /* @__PURE__ */ jsx("div", { className: "h-px w-full bg-gradient-to-r from-waify-green/40 to-transparent" }) }),
          /* @__PURE__ */ jsxs("div", { className: "relative mb-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-waify-green text-white shadow-lg shadow-waify-green/25", children: icon }),
            /* @__PURE__ */ jsx("span", { className: "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-waify-ink text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-950", children: index + 1 })
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: desc })
        ] }, title)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 text-center", children: /* @__PURE__ */ jsx(Link, { href: route("onboarding"), children: /* @__PURE__ */ jsxs(Button, { children: [
          /* @__PURE__ */ jsx(MarketingIcon, { name: "wand-2", size: 18 }),
          " Start setup wizard"
        ] }) }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "border-y border-gray-100 py-16 dark:border-slate-800", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Built around the tools you already use" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "WhatsApp Cloud API, Meta Leads, Razorpay, Google Sheets, Calendar, AI providers, Shopify, WooCommerce, Zapier, Make, Slack, and developer webhooks." }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3", children: integrations.map((item) => /* @__PURE__ */ jsxs("div", { className: "mkt-card-lift flex items-start gap-3 rounded-xl bg-white p-4 text-sm ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700", children: [
          /* @__PURE__ */ jsx(ProviderLogo, { id: item.providerId, name: item.name, className: "h-10 w-10 rounded-lg", imageClassName: "h-5 w-5" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-waify-text dark:text-waify-dark-text", children: item.name }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: item.desc })
          ] })
        ] }, item.name)) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "py-20 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx(SectionHeading, { title: "What's live in Zyptos today", body: "Production-ready features for WhatsApp operations, billing, and automation." }),
        /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-6 md:grid-cols-3", children: [
          {
            icon: /* @__PURE__ */ jsx(Inbox, { size: 20, className: "text-waify-green-dark" }),
            title: "Workspace operations",
            body: "One WhatsApp Business connection per workspace, team roles, assignments, notes, activity logs, quick replies, and workspace billing.",
            bullets: ["Shared team inbox with assignments", "Bot controls and handoff rules", "Conversation audit trail"]
          },
          {
            icon: /* @__PURE__ */ jsx(Bot, { size: 20, className: "text-waify-green-dark" }),
            title: "Automation and AI",
            body: "Visual flow builder with branches, waits, tags, template sends, webhooks, AI-agent nodes, and run status inside the inbox.",
            bullets: ["Deterministic action nodes", "AI agent handoff and guardrails", "Anti-spam limits built-in"]
          },
          {
            icon: /* @__PURE__ */ jsx(BarChart2, { size: 20, className: "text-waify-green-dark" }),
            title: "Billing and integrations",
            body: "Plan checkout, bank/UPI and Razorpay one-time payments, Meta Leads, Google Sheets, Calendar, and webhooks.",
            bullets: ["Bank/UPI payment approval", "Razorpay one-time checkout", "Google OAuth integrations"]
          }
        ].map(({ icon, title, body, bullets }) => /* @__PURE__ */ jsxs("div", { className: "mkt-card-lift rounded-2xl border border-gray-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-waify-green/10", children: icon }),
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-waify-text dark:text-waify-dark-text", children: title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: body }),
          /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-1.5", children: bullets.map((b) => /* @__PURE__ */ jsxs("li", { className: "flex items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            /* @__PURE__ */ jsx(Check, { size: 13, className: "flex-shrink-0 text-waify-green" }),
            " ",
            b
          ] }, b)) })
        ] }, title)) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "pricing", className: "bg-gray-50/80 py-20 dark:bg-slate-950 sm:py-24", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsx(
          SectionHeading,
          {
            title: "Simple, transparent pricing",
            body: "Plans are billed per workspace. Each workspace supports one WhatsApp Business connection. Discounts, wallet credits, bank/UPI, and Razorpay one-time payment supported."
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-xl bg-white p-1 ring-1 ring-gray-200 dark:bg-slate-800 dark:ring-slate-700", children: [
          /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setAnnual(false), className: `rounded-lg px-4 py-2 text-sm font-medium transition ${!annual ? "bg-waify-green text-white" : "text-waify-text-muted"}`, children: "Monthly" }),
          /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setAnnual(true), className: `rounded-lg px-4 py-2 text-sm font-medium transition ${annual ? "bg-waify-green text-white" : "text-waify-text-muted"}`, children: [
            "Annual ",
            /* @__PURE__ */ jsx("span", { className: "ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700", children: "Save 17%" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-4", children: [
          displayPlans.map((plan, index) => {
            const popular = plan.key === "pro" || plan.key === "growth" || index === 1;
            const monthly = annual && plan.price_yearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly;
            return /* @__PURE__ */ jsxs("div", { className: `mkt-card-lift relative flex flex-col rounded-2xl border bg-white p-6 dark:bg-slate-900 ${popular ? "border-waify-green shadow-lg shadow-waify-green/10 dark:border-waify-green/50" : "border-gray-200 dark:border-slate-700"}`, children: [
              popular && /* @__PURE__ */ jsx("div", { className: "absolute -top-3.5 left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsx(Badge, { variant: "success", className: "shadow-sm", children: "Most popular" }) }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-waify-text dark:text-waify-dark-text", children: plan.name }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 min-h-[44px] text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.description || "Everything needed to launch WhatsApp operations." }),
              /* @__PURE__ */ jsxs("p", { className: "mt-4", children: [
                /* @__PURE__ */ jsx("span", { className: "text-3xl font-extrabold tabular-nums text-waify-text dark:text-waify-dark-text", children: formatPrice(monthly, plan.currency || "INR") }),
                monthly > 0 && /* @__PURE__ */ jsx("span", { className: "text-sm text-waify-text-muted", children: "/mo" })
              ] }),
              annual && plan.price_yearly && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs font-medium text-waify-green-dark", children: [
                "Billed ",
                formatPrice(plan.price_yearly, plan.currency || "INR"),
                "/year"
              ] }),
              (plan.trial_days ?? 0) > 0 && /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs font-medium text-waify-green-dark", children: [
                plan.trial_days,
                "-day free trial included"
              ] }),
              /* @__PURE__ */ jsx("ul", { className: "mt-5 flex-1 space-y-2.5 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: plan.features.slice(0, 5).map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(Check, { size: 15, className: "mt-0.5 flex-shrink-0 text-waify-green" }),
                feature
              ] }, feature)) }),
              /* @__PURE__ */ jsx(Link, { href: `${route("register")}?plan=${plan.key}&cycle=${annual ? "yearly" : "monthly"}`, children: /* @__PURE__ */ jsx(Button, { className: "mt-6 w-full", variant: popular ? "primary" : "secondary", children: "Get started" }) })
            ] }, plan.id);
          }),
          /* @__PURE__ */ jsxs("div", { className: "mkt-card-lift relative flex flex-col overflow-hidden rounded-2xl bg-waify-ink p-6 text-white", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "pointer-events-none absolute inset-0 opacity-10",
                style: {
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "24px 24px"
                }
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-waify-green/60 to-transparent" }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex h-full flex-col", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "success", className: "mb-4 w-fit", children: "Custom" }),
              /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold", children: "Enterprise" }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 min-h-[44px] text-sm leading-relaxed text-slate-400", children: "Custom limits, Meta readiness support, onboarding help, workspace controls, and priority operations." }),
              /* @__PURE__ */ jsx("p", { className: "mt-4 text-3xl font-extrabold", children: "Talk to us" }),
              /* @__PURE__ */ jsx("ul", { className: "mt-5 flex-1 space-y-2.5 text-sm text-slate-300", children: ["Custom workspaces", "High-volume sending", "Dedicated onboarding", "Security and review support"].map((feature) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(Check, { size: 15, className: "mt-0.5 flex-shrink-0 text-waify-green" }),
                feature
              ] }, feature)) }),
              /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { className: "mt-6 w-full bg-white text-waify-green-darker hover:bg-white/95", children: "Contact sales" }) })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("section", { id: "faq", className: "mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-center text-3xl font-bold", children: "Frequently asked questions" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-center text-sm text-waify-text-muted", children: [
          "Can't find an answer?",
          " ",
          /* @__PURE__ */ jsx(Link, { href: route("faqs"), className: "font-medium text-waify-green-dark hover:underline", children: "Browse all FAQs" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsx(MarketingFaqAccordion, { items: marketingFaq.slice(0, 4) }) })
      ] }),
      /* @__PURE__ */ jsx("section", { className: "pb-20 pt-4 sm:pb-24", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-5xl px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-waify-ink px-8 py-16 text-center text-white sm:px-14", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute left-[-10%] top-[-20%] h-72 w-72 rounded-full bg-waify-green/30 blur-[80px]" }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-[-20%] right-[-5%] h-64 w-64 rounded-full bg-emerald-500/20 blur-[70px]" }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute inset-0 opacity-10",
            style: {
              backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-waify-green/50 to-transparent" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxs("span", { className: "mb-4 inline-flex items-center gap-2 rounded-full border border-waify-green/30 bg-waify-green/10 px-3 py-1 text-xs font-semibold text-emerald-400", children: [
            /* @__PURE__ */ jsx(Zap, { size: 12 }),
            " Ready to get started?"
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: "Turn WhatsApp chats into revenue" }),
          /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-xl text-base text-white/75", children: "Join teams using Zyptos for WhatsApp campaigns, Meta APIs, automations, inbox, and billing." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col justify-center gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsx(Button, { className: "h-12 bg-waify-green px-8 text-white shadow-lg shadow-waify-green/30 hover:bg-waify-green-dark", children: "Start free trial" }) }),
            /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", className: "h-12 border-white/20 bg-white/10 px-6 text-white ring-white/20 hover:bg-white/15", children: "Talk to sales" }) })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-slate-500", children: "14-day free trial · No credit card required · Cancel anytime" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsx(MarketingSiteFooter, {}),
      /* @__PURE__ */ jsx(MarketingWhatsAppFloater, {}),
      /* @__PURE__ */ jsx(CookieConsentBanner, {}),
      /* @__PURE__ */ jsx(AnalyticsScripts, {})
    ] })
  ] });
}
function SectionHeading({ eyebrow, title, body }) {
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
    eyebrow && /* @__PURE__ */ jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-waify-green-dark", children: eyebrow }),
    /* @__PURE__ */ jsx("h2", { className: "mt-2 text-3xl font-bold tracking-tight sm:text-4xl", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: body })
  ] });
}
function HeroDashboard() {
  const campaigns = [
    { name: "Summer Sale", delivered: "92.1%", responses: "4.3K", conversion: "10.5%" },
    { name: "New Collection", delivered: "96.3%", responses: "6.1K", conversion: "11.2%" },
    { name: "Special Offer", delivered: "97.8%", responses: "2.9K", conversion: "8.7%" }
  ];
  const barHeights = [38, 55, 48, 65, 72, 60, 80, 68, 75, 88, 70, 85];
  return /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-[600px] lg:max-w-none", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute -inset-6 rounded-[3rem] bg-waify-green/20 blur-3xl" }),
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl bg-[#0d1b2e] shadow-2xl ring-1 ring-white/10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 border-b border-white/5 bg-[#09121e] px-4 py-2.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-red-500/70" }),
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-amber-500/70" }),
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-emerald-500/70" }),
        /* @__PURE__ */ jsx("span", { className: "ml-3 font-mono text-[10px] text-slate-500", children: "Zyptos — Dashboard" }),
        /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-waify-green animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "text-[9px] text-emerald-400", children: "Live" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("div", { className: "flex w-11 flex-col items-center gap-3.5 border-r border-white/5 bg-[#09121e] py-4", children: [
          { Icon: BarChart2, active: true },
          { Icon: Megaphone, active: false },
          { Icon: Users, active: false },
          { Icon: Workflow, active: false },
          { Icon: TrendingUp, active: false },
          { Icon: MessageCircle, active: false }
        ].map(({ Icon, active }, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `flex h-7 w-7 items-center justify-center rounded-lg transition ${active ? "bg-waify-green text-white" : "text-slate-600 hover:text-slate-400"}`,
            children: /* @__PURE__ */ jsx(Icon, { size: 13 })
          },
          i
        )) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 p-3", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3 grid grid-cols-4 gap-2", children: [
            { label: "Messages Sent", value: "128.6K", change: "+28.5%", up: true },
            { label: "Delivered", value: "98.7%", change: "+12.4%", up: true },
            { label: "Responses", value: "25.3K", change: "+31.7%", up: true },
            { label: "Conversion", value: "9.6%", change: "+18.2%", up: true }
          ].map(({ label, value, change, up }) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-[#0f1f35] p-2.5 ring-1 ring-white/5", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-1 text-[9px] text-slate-500", children: label }),
            /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-white", children: value }),
            /* @__PURE__ */ jsx("div", { className: `text-[9px] font-semibold ${up ? "text-emerald-400" : "text-red-400"}`, children: change })
          ] }, label)) }),
          /* @__PURE__ */ jsxs("div", { className: "mb-3 rounded-lg bg-[#0f1f35] p-3 ring-1 ring-white/5", children: [
            /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-slate-400", children: "Performance Overview" }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-slate-600", children: "This Month" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex h-14 items-end gap-1", children: barHeights.map((h, i) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "flex-1 rounded-t-sm",
                style: {
                  height: `${h}%`,
                  background: i === barHeights.length - 1 ? "#00A548" : `rgba(0, 165, 72, ${0.25 + h / 100 * 0.4})`
                }
              },
              i
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-[#0f1f35] ring-1 ring-white/5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-white/5 px-3 py-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-slate-400", children: "Top Campaigns" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full bg-waify-green/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400", children: "3 active" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "divide-y divide-white/5", children: campaigns.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-1.5 w-1.5 flex-shrink-0 rounded-full",
                  style: { background: i === 0 ? "#00A548" : i === 1 ? "#128C7E" : "#4ade80" }
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "flex-1 text-[10px] font-medium text-slate-300", children: c.name }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-slate-500", children: c.delivered }),
              /* @__PURE__ */ jsx("div", { className: "w-12 overflow-hidden rounded-full bg-slate-700/50", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-1 rounded-full bg-waify-green",
                  style: { width: c.delivered }
                }
              ) }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] font-semibold text-emerald-400", children: c.conversion })
            ] }, c.name)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute -bottom-6 -right-4 w-32 overflow-hidden rounded-[22px] bg-[#1a1a2e] shadow-2xl ring-1 ring-white/10 sm:-right-6 sm:w-36", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-waify-green-darker px-2 py-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold text-white", children: "Z" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[8px] font-semibold leading-tight text-white", children: "Zyptos Business" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5 text-[7px] text-white/60", children: [
            /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-emerald-400" }),
            " online"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1.5 bg-[#ece5dd] p-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-[90%] self-start rounded-xl rounded-tl-sm bg-white px-2 py-1.5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-[7px] leading-tight text-gray-800", children: [
            "Hi! Reply with ",
            /* @__PURE__ */ jsx("strong", { children: "pricing" }),
            " or ",
            /* @__PURE__ */ jsx("strong", { children: "demo" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-right text-[6px] text-gray-400", children: "10:24 ✓✓" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-w-[85%] self-end rounded-xl rounded-tr-sm bg-[#DCF8C6] px-2 py-1.5 shadow-sm", children: /* @__PURE__ */ jsx("p", { className: "text-[7px] text-gray-800", children: "pricing" }) }),
        /* @__PURE__ */ jsx("div", { className: "self-center rounded-full bg-emerald-100/90 px-1.5 py-0.5 text-[6px] font-semibold text-emerald-800", children: "Bot replied" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute -left-4 top-6 rounded-xl border border-white/10 bg-[#0d1b2e]/90 px-3 py-2.5 shadow-2xl backdrop-blur-sm sm:-left-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-waify-green/20", children: /* @__PURE__ */ jsx(Users, { size: 13, className: "text-emerald-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[9px] text-slate-500", children: "New Leads" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-emerald-400", children: "+8,342" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[8px] text-slate-600", children: "This month" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute -right-4 top-1/3 rounded-xl border border-white/10 bg-[#0d1b2e]/90 px-3 py-2.5 shadow-2xl backdrop-blur-sm sm:-right-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20", children: /* @__PURE__ */ jsx(TrendingUp, { size: 13, className: "text-emerald-400" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[9px] text-slate-500", children: "Growth" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-emerald-400", children: "+126%" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-[8px] text-slate-600", children: "This month" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "absolute -left-4 bottom-16 rounded-xl border border-white/10 bg-[#0d1b2e]/90 px-3 py-2 shadow-2xl backdrop-blur-sm sm:-left-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" }),
        /* @__PURE__ */ jsx("div", { className: "text-[9px] text-slate-400", children: "Msgs Delivered" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-white", children: [
        "98.7% ",
        /* @__PURE__ */ jsx("span", { className: "text-[9px] font-normal text-emerald-400", children: "↑" })
      ] })
    ] })
  ] });
}
function renderProductPanel(tab) {
  if (tab === "inbox") {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-4", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2 text-xs font-semibold uppercase text-waify-text-muted", children: "Team Inbox" }),
      ["Prashant Pandey", "New lead", "Support request"].map((name, index) => /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 rounded-lg p-2 text-xs ${index === 0 ? "bg-waify-green/10 ring-1 ring-waify-green/20" : "hover:bg-gray-50 dark:hover:bg-slate-800"}`, children: [
        /* @__PURE__ */ jsx(Avatar, { name, size: 28 }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: "truncate font-medium", children: name }),
          /* @__PURE__ */ jsx("div", { className: "truncate text-waify-text-muted", children: index === 0 ? "Show me Zyptos pricing" : index === 1 ? "Meta lead captured" : "Needs human support" })
        ] }),
        index === 0 && /* @__PURE__ */ jsx("span", { className: "flex h-5 w-5 items-center justify-center rounded-full bg-waify-green text-[10px] font-bold text-white", children: "2" })
      ] }, name))
    ] });
  }
  if (tab === "automation") {
    return /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-3 text-xs font-semibold uppercase text-waify-text-muted", children: "Automation flow" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: [
        { label: "Trigger: Inbound message", color: "bg-purple-100 text-purple-700 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:ring-purple-800" },
        { label: "Condition: Contains keyword", color: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-800" },
        { label: "Action: Send template", color: "bg-waify-green/15 text-waify-green-dark ring-waify-green/25" },
        { label: "Delay: Wait 2 hours", color: "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800" },
        { label: "Handoff: Assign agent", color: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700" }
      ].map((step, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-waify-green text-[9px] font-bold text-white", children: i + 1 }),
        /* @__PURE__ */ jsx("span", { className: `rounded-lg px-3 py-1.5 text-[11px] font-medium ring-1 ${step.color}`, children: step.label })
      ] }, step.label)) }),
      /* @__PURE__ */ jsx("p", { className: "mt-4 text-xs text-waify-text-muted", children: "Lead qualification · test mode · run history" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase text-waify-text-muted", children: "Active campaign" }),
      /* @__PURE__ */ jsx(Badge, { variant: "success", children: "Live" })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Zyptos plan follow-up" }),
    /* @__PURE__ */ jsx("div", { className: "h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700", children: /* @__PURE__ */ jsx("div", { className: "h-full w-[94%] rounded-full bg-waify-green" }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-2 text-center text-xs", children: [["12.4K", "Queued"], ["11.6K", "Sent"], ["11.4K", "Delivered"], ["3.2K", "Replies"]].map(([value, label]) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg bg-gray-50 p-2 dark:bg-slate-800", children: [
      /* @__PURE__ */ jsx("div", { className: "font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value }),
      /* @__PURE__ */ jsx("div", { className: "text-waify-text-muted", children: label })
    ] }, label)) }),
    /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-waify-green/8 p-2.5 ring-1 ring-waify-green/15", children: /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium text-waify-green-dark", children: "98.7% delivery rate · 27.4% reply rate" }) })
  ] });
}
export {
  Landing as default
};
