import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, usePage, Link } from "@inertiajs/react";
import { MessageCircle, Target, Search, Clock, CreditCard, Sparkles, Workflow, Bell, Server, ArrowLeft, ArrowUpRight, Zap, BarChart2, TrendingUp, MapPin, Mail, Key, Shield, Check, Wand2, Send, FileCheck, Users, Link2, LayoutDashboard, PlayCircle, Rocket, FileText, Megaphone, HelpCircle, ChevronUp, ChevronDown, X, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { B as BrandingWrapper, T as ThemeToggle } from "./BrandingWrapper-DdVUILzh.js";
import { B as BrandLogo } from "./BrandLogo-TeztHB0m.js";
import { C as CookieConsentBanner, A as AnalyticsScripts } from "./CookieConsentBanner-X10ew4Dy.js";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { P as ProviderLogo } from "./ProviderLogo-1eHVtujo.js";
function SeoHead({ seo }) {
  if (!seo) {
    return null;
  }
  const title = seo.title || seo.site_name || "Zyptos";
  const description = seo.description || "";
  const canonical = seo.canonical || seo.url;
  const image = seo.image;
  return /* @__PURE__ */ jsxs(Head, { title, children: [
    description && /* @__PURE__ */ jsx("meta", { "head-key": "description", name: "description", content: description }),
    seo.keywords && /* @__PURE__ */ jsx("meta", { "head-key": "keywords", name: "keywords", content: seo.keywords }),
    seo.robots && /* @__PURE__ */ jsx("meta", { "head-key": "robots", name: "robots", content: seo.robots }),
    canonical && /* @__PURE__ */ jsx("link", { "head-key": "canonical", rel: "canonical", href: canonical }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:type", property: "og:type", content: seo.type || "website" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "og:title", property: "og:title", content: title }),
    description && /* @__PURE__ */ jsx("meta", { "head-key": "og:description", property: "og:description", content: description }),
    seo.url && /* @__PURE__ */ jsx("meta", { "head-key": "og:url", property: "og:url", content: seo.url }),
    seo.site_name && /* @__PURE__ */ jsx("meta", { "head-key": "og:site_name", property: "og:site_name", content: seo.site_name }),
    seo.locale && /* @__PURE__ */ jsx("meta", { "head-key": "og:locale", property: "og:locale", content: seo.locale }),
    image && /* @__PURE__ */ jsx("meta", { "head-key": "og:image", property: "og:image", content: image }),
    image && /* @__PURE__ */ jsx("meta", { "head-key": "og:image:alt", property: "og:image:alt", content: `${seo.site_name || "Zyptos"} product preview` }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:card", name: "twitter:card", content: seo.twitter_card || "summary_large_image" }),
    /* @__PURE__ */ jsx("meta", { "head-key": "twitter:title", name: "twitter:title", content: title }),
    description && /* @__PURE__ */ jsx("meta", { "head-key": "twitter:description", name: "twitter:description", content: description }),
    image && /* @__PURE__ */ jsx("meta", { "head-key": "twitter:image", name: "twitter:image", content: image }),
    (seo.schemas || []).map((schema, index) => /* @__PURE__ */ jsx(
      "script",
      {
        "head-key": `schema-${index}`,
        type: "application/ld+json",
        dangerouslySetInnerHTML: { __html: JSON.stringify(schema) }
      },
      `schema-${index}`
    ))
  ] });
}
const navSections = [
  { id: "features", label: "Features" },
  { id: "product", label: "Product" },
  { id: "how", label: "How it works" },
  { id: "pricing", label: "Pricing" }
];
const resourceLinks = [
  { key: "faq", label: "FAQs", href: () => route("faqs") },
  { key: "knowledgebase", label: "Knowledge base", href: () => route("knowledgebase") },
  { key: "roadmap", label: "Roadmap", href: () => route("roadmap") },
  { key: "docs", label: "Docs", href: () => route("docs") },
  { key: "about", label: "About", href: () => route("about") },
  { key: "contact", label: "Contact", href: () => route("contact") }
];
const legalLinks = [
  { key: "privacy", label: "Privacy", href: () => route("privacy") },
  { key: "terms", label: "Terms", href: () => route("terms") },
  { key: "refund", label: "Refunds", href: () => route("refund.policy") },
  { key: "acceptableUse", label: "Acceptable use", href: () => route("acceptable.use") },
  { key: "qrDisclaimer", label: "QR disclaimer", href: () => route("qr.disclaimer") },
  { key: "gdpr", label: "GDPR", href: () => route("gdpr") },
  { key: "cookies", label: "Cookies", href: () => route("cookies") },
  { key: "security", label: "Security", href: () => route("security") }
];
const marketingFaq = [
  { q: "Do I need my own WhatsApp Business Account?", a: "Yes. Zyptos connects to your Meta WABA and guides you through number registration, templates, webhooks, and team setup. Cloud API is the recommended production connection." },
  { q: "Can my team use one shared inbox?", a: "Yes. Agents can reply from one inbox with assignments, notes, quick replies, SLA visibility, and workspace permissions." },
  { q: "Are Meta conversation charges included?", a: "No. Zyptos subscription fees and Meta conversation charges are separate. Meta charges depend on your WABA, country, category, and Meta billing setup." },
  { q: "How many WhatsApp numbers can one workspace connect?", a: "One workspace connects one WhatsApp Business number. Use separate workspaces for separate brands, clients, or numbers." },
  { q: "Can I renew the same plan after a trial or expired period?", a: "Yes. Billing supports restarting the same plan, selecting a cycle, applying discounts, bank/UPI payment, Razorpay one-time payment, and GST invoice PDFs." },
  { q: "Can I start Enterprise directly?", a: "No. Enterprise activation is admin-approved because limits, onboarding, billing, and Meta readiness must be reviewed before access is granted." },
  { q: "Is QR WhatsApp login official?", a: "No. QR mode is marked unofficial. It is useful for limited cases, but Cloud API is the recommended production connection because unofficial automation can carry WhatsApp account risk." },
  { q: "Can I use my own Razorpay and AI provider keys?", a: "Yes. Workspace owners can add workspace integration credentials where available. Workspace keys are used for workspace actions, while Zyptos billing uses platform billing credentials." },
  { q: "What happens when a template is rejected?", a: "You can review the rejection reason, edit the wording, examples, variables, or buttons, then resubmit from the template manager." },
  { q: "Can I import contacts and send campaigns?", a: "Yes. Contacts, tags, segments, templates, broadcasts, failed-recipient retry, and campaign analytics are part of the workspace campaign workflow." },
  { q: "How do bank or UPI payments activate a plan?", a: "Zyptos creates an invoice first. After you pay and upload proof, a platform admin reviews it and marks the payment paid to activate or renew the workspace plan." },
  { q: "Can automations hand over to a human?", a: "Yes. Flows can assign a chat, pause the bot, show status in the inbox, and let agents take over manually when needed." },
  { q: "Which integrations are available right now?", a: "Zyptos currently includes WhatsApp Cloud API, Meta Leads, Google Sheets, Google Calendar, Razorpay, workspace AI providers, Shopify, WooCommerce, Zapier, Make, Slack, and Developer Webhooks." },
  { q: "Can Zyptos sync Google Sheets automatically?", a: "Yes, after Google OAuth is connected and the required Google APIs are enabled. You can pick a spreadsheet, map columns, import contacts, apply tags, and review sync logs." },
  { q: "Can new Meta leads alert my team?", a: "Yes. Meta Leads can create contacts, apply tags, assign or route leads, show in-app/browser notifications, and start a selected automation flow." },
  { q: "Can website visitors contact Zyptos on WhatsApp?", a: "Yes. Public pages include a Zyptos WhatsApp floater that opens a chat with +91 94106 50131 using a prefilled setup/demo message." }
];
const knowledgeBaseGuides = [
  {
    category: "WhatsApp setup",
    title: "Connect a production WABA",
    summary: "Use Cloud API embedded signup for production workspaces. Coexistence can be used where Meta allows it; QR mode is unofficial and should be treated as a separate risk choice.",
    bullets: ["Verify Meta app ID, app secret, and callback URL.", "Confirm WABA and phone permissions before syncing templates.", "Check webhook subscription, phone registration, and signature diagnostics after connection."]
  },
  {
    category: "Inbox",
    title: "Avoid duplicate bot replies",
    summary: "A conversation should have one active automation path at a time. Human handoff, bot pause, and AI-agent settings decide whether the next inbound message is automated or manual.",
    bullets: ["Pause automation when an agent replies manually.", "Use AI-agent nodes only where flexible qualification is needed.", "Review conversation timeline statuses: automation running, AI replying, completed, skipped, or failed."]
  },
  {
    category: "Campaigns",
    title: "Campaign send checks",
    summary: "Before sending, validate recipients, opt-out status, template approval, media availability, rate limits, and workspace monthly limits.",
    bullets: ["Retry only failed or bounced recipients instead of resending to everyone.", "Use segments and source tags to keep audiences clean.", "Review delivery, read, failed, and reply metrics after sending."]
  },
  {
    category: "Billing",
    title: "Plans, trials, and invoices",
    summary: "Plans are per workspace and each workspace has one WhatsApp connection. Self-service trials are limited per email account; Enterprise requires platform admin approval.",
    bullets: ["Use checkout preview for discount, GST, and final amount.", "Bank/UPI invoices need proof upload and admin approval.", "Razorpay is one-time checkout for Zyptos billing, not recurring subscriptions."]
  },
  {
    category: "Integrations",
    title: "Google, Meta Leads, and webhooks",
    summary: "Google integrations require the correct OAuth scopes and enabled Google APIs. Meta Leads uses Facebook login and form mapping, then webhook or sync jobs ingest new leads.",
    bullets: ["Enable Google Drive/Sheets/Calendar APIs in the Google Cloud project.", "Map every Meta lead field before turning on auto-ingestion.", "Use integration logs to diagnose failed syncs and replay eligible events."]
  },
  {
    category: "Security",
    title: "Credential and role safety",
    summary: "Workspace API keys, AI provider keys, Razorpay keys, WABA tokens, and webhook secrets should be visible/editable only to owners or admins with the right permission.",
    bullets: ["Never expose decrypted secrets in the UI.", "Use audit logs for credential changes and destructive actions.", "Revoke sessions after password reset or suspicious activity."]
  },
  {
    category: "Appointments",
    title: "Appointment and reminder flow",
    summary: "Use appointment slots, Google Calendar sync, WhatsApp reminders, and lead source context to keep bookings connected to conversations.",
    bullets: ["Create clear appointment types before sharing links.", "Send confirmation and reminder templates only to opted-in contacts.", "Review no-shows and reschedule requests from the conversation timeline."]
  },
  {
    category: "Policy",
    title: "WhatsApp policy basics",
    summary: "Zyptos provides tools, but your business remains responsible for consent, content, template accuracy, opt-outs, and Meta commerce or messaging restrictions.",
    bullets: ["Do not upload purchased or scraped lists.", "Honor stop/unsubscribe requests quickly.", "Avoid misleading templates, prohibited goods, or high-frequency cold outreach."]
  },
  {
    category: "Website widget",
    title: "Use the Zyptos WhatsApp floater",
    summary: "The public website can show a WhatsApp click-to-chat floater for quick sales, onboarding, support, and demo requests.",
    bullets: ["The public Zyptos floater opens WhatsApp to +91 94106 50131.", "Workspace widgets can be created from Tools and embedded on customer websites.", "Use a short prefilled message so visitors know what to ask."]
  },
  {
    category: "Provider setup",
    title: "Available provider integrations",
    summary: "Provider integrations are shown with real logos and dedicated setup flows so teams know exactly which services Zyptos supports.",
    bullets: ["Payments: Razorpay payment links and Zyptos billing checkout.", "AI: OpenAI, Anthropic, and Gemini workspace credentials.", "Productivity and automation: Google Sheets, Google Calendar, Zapier, Make, Slack, and Developer Webhooks."]
  }
];
const roadmapItems = [
  { status: "Available", quarter: "Now", title: "WhatsApp workspace operations", desc: "One WhatsApp Business number per workspace, shared inbox, contacts, segments, templates, broadcasts, assignments, notes, and team permissions." },
  { status: "Available", quarter: "Now", title: "Billing and payments", desc: "Plan checkout, discounts, bank/UPI payment approval, Razorpay one-time payments, payment proof review, and downloadable invoice PDFs." },
  { status: "Available", quarter: "Now", title: "Automations and AI agents", desc: "Visual flows with branches, waits, tags, template sends, webhooks, AI-agent handoff, bot pause controls, and run status inside the inbox." },
  { status: "Improving", quarter: "Next", title: "Lead capture and appointments", desc: "Deeper Meta Lead Forms sync, lead alerts, source tracking, appointment scheduling, Google Calendar sync, reminders, and follow-up automation." },
  { status: "Improving", quarter: "Next", title: "Campaign reliability", desc: "Better failed-recipient retry, delivery diagnostics, audience validation, opt-out safety, rate-limit visibility, and campaign performance insights." },
  { status: "Planned", quarter: "Later", title: "Mobile app upgrades", desc: "More complete mobile inbox, push notifications, quick replies, assignment actions, profile management, and call handling for agents on the move." }
];
const integrations = [
  { name: "WhatsApp Cloud API", providerId: "whatsapp", icon: MessageCircle, color: "#00A548", desc: "Official WABA connection, templates, webhooks, inbox, campaigns, and calling readiness." },
  { name: "Meta Leads", providerId: "meta-leads", icon: Target, color: "#1877F2", desc: "Facebook lead forms, field mapping, lead alerts, contact creation, and automation triggers." },
  { name: "Google Sheets", providerId: "google-sheets", icon: Search, color: "#0F9D58", desc: "Import contacts and lead rows with mapped columns, tags, and sync logs." },
  { name: "Google Calendar", providerId: "google-calendar", icon: Clock, color: "#4285F4", desc: "Appointment sync, upcoming event imports, reminders, and meeting links." },
  { name: "Razorpay", providerId: "razorpay", icon: CreditCard, color: "#0B72E7", desc: "Workspace payment links for customer payments and Zyptos one-time checkout for billing." },
  { name: "Workspace AI", providerId: "workspace-ai", icon: Sparkles, color: "#10B981", desc: "Workspace OpenAI, Anthropic, or Gemini keys for AI agents, suggestions, and automation nodes." },
  { name: "Shopify", providerId: "shopify", icon: CreditCard, color: "#7AB55C", desc: "Import products and orders for ecommerce recovery and order-aware conversations." },
  { name: "WooCommerce", providerId: "woocommerce", icon: CreditCard, color: "#96588A", desc: "Sync store products and orders through WooCommerce REST API." },
  { name: "Zapier", providerId: "zapier", icon: Workflow, color: "#FF4A00", desc: "Send Zyptos webhook events into Zapier catch hooks." },
  { name: "Make", providerId: "make", icon: Workflow, color: "#6D00CC", desc: "Trigger Make scenarios from real workspace webhook events." },
  { name: "Slack", providerId: "slack", icon: Bell, color: "#4A154B", desc: "Send operational notifications to Slack incoming webhooks." },
  { name: "Developer Webhooks", providerId: "developer-webhooks", icon: Server, color: "#111827", desc: "API keys, signed outbound webhooks, delivery logs, tests, and replay support." }
];
const iconMap = {
  megaphone: Megaphone,
  workflow: Workflow,
  "message-circle": MessageCircle,
  "file-text": FileText,
  target: Target,
  "credit-card": CreditCard,
  sparkles: Sparkles,
  rocket: Rocket,
  "play-circle": PlayCircle,
  "layout-dashboard": LayoutDashboard,
  "link-2": Link2,
  users: Users,
  "file-check": FileCheck,
  send: Send,
  "wand-2": Wand2,
  check: Check,
  shield: Shield,
  key: Key,
  server: Server,
  bell: Bell,
  mail: Mail,
  "map-pin": MapPin,
  clock: Clock,
  search: Search,
  "trending-up": TrendingUp,
  "bar-chart-2": BarChart2,
  zap: Zap,
  "arrow-up-right": ArrowUpRight
};
function MarketingIcon({ name, className, size = 18 }) {
  const Icon = iconMap[name] || HelpCircle;
  return /* @__PURE__ */ jsx(Icon, { className, size });
}
function marketingSectionHref(section) {
  return section === "pricing" ? route("pricing") : `${route("landing")}#${section}`;
}
function namedRoute(name, fallback) {
  return window.route?.has?.(name) ?? false ? route(name) : fallback;
}
function dashboardHref(auth, accounts) {
  if (!auth?.user) return null;
  if (auth.user.is_platform_admin || auth.user.is_super_admin) return route("platform.dashboard");
  return Array.isArray(accounts) && accounts.length > 0 ? route("app.dashboard") : route("onboarding");
}
const mobileNavSections = [
  { id: "features", label: "Features", icon: Zap, desc: "Broadcasts, automation, inbox" },
  { id: "product", label: "Product", icon: LayoutDashboard, desc: "Live dashboard tour" },
  { id: "how", label: "How it works", icon: Workflow, desc: "4-step setup guide" },
  { id: "pricing", label: "Pricing", icon: CreditCard, desc: "Simple per-workspace plans" }
];
const mobileResourceSections = [
  { key: "faq", label: "FAQs", icon: HelpCircle, href: () => route("faqs") },
  { key: "knowledgebase", label: "Knowledge base", icon: FileText, href: () => route("knowledgebase") },
  { key: "roadmap", label: "Roadmap", icon: TrendingUp, href: () => route("roadmap") },
  { key: "docs", label: "Docs", icon: FileCheck, href: () => route("docs") },
  { key: "about", label: "About", icon: Users, href: () => route("about") },
  { key: "contact", label: "Contact", icon: Mail, href: () => route("contact") }
];
function MarketingSiteNav({ currentPage = "home" }) {
  const { auth, accounts } = usePage().props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dashHref = dashboardHref(auth, accounts);
  const canRegister = window.route?.has?.("register") ?? true;
  const canLogin = window.route?.has?.("login") ?? true;
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  const navBtn = (active = false) => cn(
    "px-3 py-2 rounded-lg transition text-sm font-medium",
    active ? "bg-waify-green/10 text-waify-green-dark" : "text-waify-text-muted hover:text-waify-text hover:bg-gray-50 dark:hover:bg-slate-800"
  );
  const pageLink = (key, href, label) => /* @__PURE__ */ jsx(
    Link,
    {
      href,
      onClick: () => {
        setMobileOpen(false);
        setResourcesOpen(false);
      },
      className: cn(
        "block rounded-lg px-3 py-2 text-sm",
        currentPage === key ? "bg-waify-green/10 font-medium text-waify-green-dark" : "text-waify-text-muted hover:bg-gray-50 dark:hover:bg-slate-800"
      ),
      children: label
    },
    key
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("nav", { className: "fixed inset-x-0 top-0 z-50", children: /* @__PURE__ */ jsx("div", { className: cn("mx-auto max-w-7xl px-4 transition sm:px-6 lg:px-8", scrolled ? "pt-2" : "pt-3"), children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex h-14 items-center justify-between rounded-2xl px-4 shadow-sm ring-1 backdrop-blur-lg transition sm:h-16 sm:px-5",
          scrolled ? "bg-white/95 ring-black/10 shadow-md dark:bg-slate-900/95 dark:ring-white/10" : "bg-white/85 ring-black/5 dark:bg-slate-900/85 dark:ring-white/10"
        ),
        children: [
          /* @__PURE__ */ jsx(Link, { href: route("landing"), className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(BrandLogo, { variant: "auto", imageClassName: "h-8" }) }),
          /* @__PURE__ */ jsxs("div", { className: "hidden items-center gap-0.5 lg:flex", children: [
            currentPage !== "home" && /* @__PURE__ */ jsx(Link, { href: route("landing"), className: navBtn(), children: "Home" }),
            navSections.map((item) => /* @__PURE__ */ jsx(Link, { href: marketingSectionHref(item.id), className: navBtn(currentPage === "pricing" && item.id === "pricing"), children: item.label }, item.id)),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: cn(navBtn([...resourceLinks, ...legalLinks].some((item) => item.key === currentPage)), "inline-flex items-center gap-1"),
                  onClick: () => setResourcesOpen((open) => !open),
                  children: [
                    "Resources ",
                    /* @__PURE__ */ jsx(ChevronDown, { size: 14, className: cn("transition", resourcesOpen && "rotate-180") })
                  ]
                }
              ),
              resourcesOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("button", { type: "button", className: "fixed inset-0 z-40 cursor-default", onClick: () => setResourcesOpen(false), "aria-label": "Close resources menu" }),
                /* @__PURE__ */ jsxs("div", { className: "absolute right-0 top-full z-50 mt-2 w-56 rounded-xl bg-white py-1 shadow-pop ring-1 ring-gray-100 dark:bg-slate-900 dark:ring-slate-700", children: [
                  resourceLinks.map((item) => pageLink(item.key, item.href(), item.label)),
                  /* @__PURE__ */ jsx("div", { className: "my-1 border-t border-gray-100 dark:border-slate-700" }),
                  /* @__PURE__ */ jsx("p", { className: "px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-waify-text-muted", children: "Legal" }),
                  legalLinks.map((item) => pageLink(item.key, item.href(), item.label))
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ThemeToggle, {}),
            dashHref ? /* @__PURE__ */ jsx(Link, { href: dashHref, className: "hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-waify-text-muted hover:text-waify-text sm:inline-flex", children: "Dashboard" }) : canLogin ? /* @__PURE__ */ jsx(Link, { href: route("login"), className: "hidden h-9 items-center rounded-lg px-3 text-sm font-medium text-waify-text-muted hover:text-waify-text sm:inline-flex", children: "Sign in" }) : null,
            canRegister && !dashHref && /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsx("span", { className: "hidden h-9 items-center rounded-lg bg-waify-green px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-waify-green-dark sm:inline-flex", children: "Start free" }) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "flex h-9 w-9 items-center justify-center rounded-lg text-waify-text transition hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden",
                onClick: () => setMobileOpen((open) => !open),
                "aria-label": mobileOpen ? "Close menu" : "Open menu",
                children: mobileOpen ? /* @__PURE__ */ jsx(X, { size: 20 }) : /* @__PURE__ */ jsx(Menu, { size: 20 })
              }
            )
          ] })
        ]
      }
    ) }) }),
    mobileOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-[60] lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
          onClick: () => setMobileOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-slate-900 anim-slide-right", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-slate-800", children: [
          /* @__PURE__ */ jsx(Link, { href: route("landing"), onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsx(BrandLogo, { variant: "auto", imageClassName: "h-8" }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setMobileOpen(false),
              className: "flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-waify-text-muted transition hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700",
              "aria-label": "Close menu",
              children: /* @__PURE__ */ jsx(X, { size: 18 })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto px-4 py-4", children: [
          /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-waify-text-muted", children: "Product" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-1", children: mobileNavSections.map((item) => {
            const Icon = item.icon;
            const href = marketingSectionHref(item.id);
            const isActive = currentPage === "pricing" && item.id === "pricing";
            return /* @__PURE__ */ jsxs(
              Link,
              {
                href,
                onClick: () => setMobileOpen(false),
                className: cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 transition",
                  isActive ? "bg-waify-green/10 text-waify-green-dark" : "hover:bg-gray-50 dark:hover:bg-slate-800"
                ),
                children: [
                  /* @__PURE__ */ jsx("span", { className: cn("flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl", isActive ? "bg-waify-green/15" : "bg-gray-100 dark:bg-slate-800"), children: /* @__PURE__ */ jsx(Icon, { size: 18, className: isActive ? "text-waify-green-dark" : "text-waify-text-muted" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsx("div", { className: cn("text-sm font-semibold", isActive ? "text-waify-green-dark" : "text-waify-text dark:text-waify-dark-text"), children: item.label }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-waify-text-muted", children: item.desc })
                  ] }),
                  /* @__PURE__ */ jsx(ArrowUpRight, { size: 14, className: "ml-auto flex-shrink-0 text-waify-text-muted opacity-40" })
                ]
              },
              item.id
            );
          }) }),
          /* @__PURE__ */ jsx("div", { className: "my-4 border-t border-gray-100 dark:border-slate-800" }),
          /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-waify-text-muted", children: "Resources" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: mobileResourceSections.map((item) => {
            const Icon = item.icon;
            return /* @__PURE__ */ jsxs(
              Link,
              {
                href: item.href(),
                onClick: () => setMobileOpen(false),
                className: cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                  currentPage === item.key ? "bg-waify-green/10 font-medium text-waify-green-dark" : "text-waify-text-muted hover:bg-gray-50 dark:hover:bg-slate-800"
                ),
                children: [
                  /* @__PURE__ */ jsx(Icon, { size: 15, className: "flex-shrink-0" }),
                  item.label
                ]
              },
              item.key
            );
          }) }),
          /* @__PURE__ */ jsx("div", { className: "my-4 border-t border-gray-100 dark:border-slate-800" }),
          /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-waify-text-muted", children: "Legal" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: legalLinks.map((item) => /* @__PURE__ */ jsx(
            Link,
            {
              href: item.href(),
              onClick: () => setMobileOpen(false),
              className: cn(
                "rounded-xl px-3 py-2 text-sm transition",
                currentPage === item.key ? "bg-waify-green/10 font-medium text-waify-green-dark" : "text-waify-text-muted hover:bg-gray-50 dark:hover:bg-slate-800"
              ),
              children: item.label
            },
            item.key
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 px-4 pb-6 pt-4 dark:border-slate-800", children: dashHref ? /* @__PURE__ */ jsx(Link, { href: dashHref, onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsxs("span", { className: "flex h-11 w-full items-center justify-center rounded-xl bg-waify-green text-sm font-semibold text-white shadow-sm", children: [
          /* @__PURE__ */ jsx(LayoutDashboard, { size: 16, className: "mr-2" }),
          " Open dashboard"
        ] }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          canRegister && /* @__PURE__ */ jsx(Link, { href: route("register"), onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsxs("span", { className: "flex h-11 w-full items-center justify-center rounded-xl bg-waify-green text-sm font-semibold text-white shadow-sm", children: [
            /* @__PURE__ */ jsx(Rocket, { size: 16, className: "mr-2" }),
            " Start free — no credit card"
          ] }) }),
          canLogin && /* @__PURE__ */ jsx(Link, { href: route("login"), onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsx("span", { className: "flex h-11 w-full items-center justify-center rounded-xl bg-gray-100 text-sm font-semibold text-waify-text dark:bg-slate-800 dark:text-waify-dark-text", children: "Sign in" }) })
        ] }) })
      ] })
    ] })
  ] });
}
function MarketingSiteFooter() {
  const { branding } = usePage().props;
  const platformName = branding?.platform_name || "Zyptos";
  return /* @__PURE__ */ jsx("footer", { className: "border-t border-slate-800 bg-waify-ink py-14 text-slate-300", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-8 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1.7fr)_repeat(3,minmax(150px,1fr))]", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Link, { href: route("landing"), className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
          BrandLogo,
          {
            variant: "dark",
            imageClassName: "h-9 max-w-[150px]",
            fallbackTextClassName: "text-white"
          }
        ) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-xs text-sm leading-relaxed text-slate-400", children: "WhatsApp operations platform for campaigns, automation, shared inbox, Meta APIs, team workflows, and billing." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex gap-2", children: [
          /* @__PURE__ */ jsx(Link, { href: route("register"), className: "inline-flex h-8 items-center rounded-lg bg-waify-green px-3 text-xs font-medium text-white", children: "Start free trial" }),
          /* @__PURE__ */ jsx(Link, { href: route("contact"), className: "inline-flex h-8 items-center rounded-lg bg-slate-800 px-3 text-xs font-medium text-slate-200 ring-1 ring-slate-700", children: "Contact sales" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        FooterCol,
        {
          title: "Product",
          links: [
            { label: "Features", href: marketingSectionHref("features") },
            { label: "Pricing", href: route("pricing") },
            { label: "Developer API", href: namedRoute("developer.index", route("docs")) }
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        FooterCol,
        {
          title: "Resources",
          links: [
            { label: "FAQs", href: route("faqs") },
            { label: "Knowledge base", href: route("knowledgebase") },
            { label: "Docs", href: route("docs") },
            { label: "Contact", href: route("contact") }
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        FooterCol,
        {
          title: "Legal",
          links: [
            { label: "Privacy", href: route("privacy") },
            { label: "Terms", href: route("terms") },
            { label: "Refunds", href: route("refund.policy") },
            { label: "Security", href: route("security") }
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        platformName,
        "."
      ] }),
      /* @__PURE__ */ jsx("p", { children: "Crafted with ❤️ in India" })
    ] })
  ] }) });
}
function FooterCol({ title, links }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500", children: title }),
    /* @__PURE__ */ jsx("ul", { className: "space-y-2.5 text-sm", children: links.map((link) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: link.href, className: "text-slate-400 transition hover:text-emerald-400", children: link.label }) }, link.label)) })
  ] });
}
const pageMeta = {
  home: { title: "Zyptos", subtitle: "WhatsApp marketing platform." },
  pricing: { title: "Simple, transparent pricing", subtitle: "Per-workspace plans with one WhatsApp Business connection, discounts, bank/UPI, and Razorpay one-time payment." },
  privacy: { title: "Privacy Policy", subtitle: "How Zyptos handles account, workspace, contact, billing, Meta, and support data." },
  terms: { title: "Terms of Service", subtitle: "The operating terms for using Zyptos, Meta APIs, workspaces, campaigns, billing, and automation." },
  refund: { title: "Refund and Cancellation Policy", subtitle: "How cancellations, renewals, failed payments, proof reviews, and refund requests are handled." },
  acceptableUse: { title: "Acceptable Use Policy", subtitle: "Practical messaging rules for consent, campaigns, templates, automation, AI replies, and Meta policy compliance." },
  qrDisclaimer: { title: "QR WhatsApp Disclaimer", subtitle: "Important limits and risks for unofficial QR login compared with Meta Cloud API." },
  faq: { title: "Frequently asked questions", subtitle: "Answers about WhatsApp onboarding, billing, plans, workspace permissions, and Meta readiness." },
  gdpr: { title: "GDPR", subtitle: "Data subject rights, lawful basis, subprocessors, and export/delete workflows." },
  cookies: { title: "Cookies", subtitle: "How Zyptos uses essential session cookies and optional analytics preferences." },
  security: { title: "Security", subtitle: "Encryption, role-based access, audit logs, webhook verification, and incident readiness." },
  help: { title: "Help center", subtitle: "Guides for setup, Meta connections, templates, automation, billing, and diagnostics." },
  knowledgebase: { title: "Knowledge base", subtitle: "Search practical setup guides for Meta, billing, workspaces, and campaigns." },
  roadmap: { title: "Roadmap", subtitle: "Customer-facing improvements for WhatsApp operations, billing, automations, integrations, and mobile workflows." },
  docs: { title: "Documentation", subtitle: "Practical setup notes for workspaces, billing, Meta readiness, integrations, and automation safety." },
  about: { title: "Built for WhatsApp operations", subtitle: "A platform for teams that need Meta-aware messaging, workspace management, and reliable billing." },
  contact: { title: "Contact Zyptos", subtitle: "Talk to us about setup, sales, support, Meta onboarding, billing, or migration." },
  survey: { title: "Feedback form", subtitle: "Share your response with this workspace." }
};
function MarketingLayout({ page, children, wide = false }) {
  const meta = pageMeta[page];
  const { seo } = usePage().props;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  return /* @__PURE__ */ jsx(BrandingWrapper, { children: /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-white text-waify-text dark:bg-slate-900 dark:text-waify-dark-text", children: [
    /* @__PURE__ */ jsx(MarketingSiteNav, { currentPage: page }),
    /* @__PURE__ */ jsxs("main", { className: "min-h-screen pt-[5.5rem] sm:pt-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "hero-mesh relative border-b border-gray-100 dark:border-slate-800", children: [
        /* @__PURE__ */ jsx("div", { className: "marketing-grid-pattern pointer-events-none absolute inset-0 opacity-30" }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8", children: [
          /* @__PURE__ */ jsxs(Link, { href: route("landing"), className: "mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-waify-green-dark hover:underline", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }),
            " Back to home"
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold tracking-tight sm:text-4xl", children: meta.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-base text-waify-text-muted dark:text-waify-dark-text-muted", children: meta.subtitle })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: cn("mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:px-8", wide ? "max-w-6xl" : "max-w-3xl"), children: [
        children,
        /* @__PURE__ */ jsxs("div", { className: "mt-12 rounded-2xl bg-gradient-to-br from-waify-green/10 to-transparent p-6 text-center ring-1 ring-waify-green/20 dark:from-waify-green/15 sm:p-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-waify-text dark:text-waify-dark-text", children: "Ready to grow on WhatsApp?" }),
          /* @__PURE__ */ jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Start your trial, connect Meta, configure billing, and launch your first campaign." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col justify-center gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsx(Link, { href: route("register"), children: /* @__PURE__ */ jsx(Button, { children: "Start free trial" }) }),
            /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Contact sales" }) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SeoHead, { seo }),
    /* @__PURE__ */ jsx(MarketingSiteFooter, {}),
    /* @__PURE__ */ jsx(MarketingWhatsAppFloater, {}),
    /* @__PURE__ */ jsx(CookieConsentBanner, {}),
    /* @__PURE__ */ jsx(AnalyticsScripts, {})
  ] }) });
}
function MarketingWhatsAppFloater() {
  const phone = "919410650131";
  const text = encodeURIComponent("Hi Zyptos team, I need help with WhatsApp setup, pricing, or a demo.");
  return /* @__PURE__ */ jsxs(
    "a",
    {
      href: `https://wa.me/${phone}?text=${text}`,
      target: "_blank",
      rel: "noreferrer",
      className: "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-waify-green px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-waify-green/30 ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-waify-green-dark focus:outline-none focus:ring-4 focus:ring-waify-green/25",
      "aria-label": "Chat with Zyptos on WhatsApp",
      children: [
        /* @__PURE__ */ jsx(ProviderLogo, { id: "whatsapp", name: "WhatsApp", className: "h-8 w-8 rounded-full border-white/30 bg-white", imageClassName: "h-5 w-5" }),
        /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: "Chat with Zyptos" })
      ]
    }
  );
}
function MarketingFaqAccordion({ items = marketingFaq }) {
  const [open, setOpen] = useState(0);
  return /* @__PURE__ */ jsx("div", { className: "space-y-2", children: items.map((item, index) => {
    const isOpen = open === index;
    return /* @__PURE__ */ jsxs(Card, { className: cn("overflow-hidden transition ring-1", isOpen ? "ring-waify-green/30" : "ring-transparent"), children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "flex w-full items-center justify-between gap-4 p-5 text-left",
          onClick: () => setOpen(isOpen ? -1 : index),
          "aria-expanded": isOpen,
          children: [
            /* @__PURE__ */ jsx("span", { className: "pr-2 font-medium text-waify-text dark:text-waify-dark-text", children: item.q }),
            isOpen ? /* @__PURE__ */ jsx(ChevronUp, { size: 18, className: "flex-shrink-0 text-waify-text-muted" }) : /* @__PURE__ */ jsx(ChevronDown, { size: 18, className: "flex-shrink-0 text-waify-text-muted" })
          ]
        }
      ),
      isOpen && /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-waify-text-muted dark:border-slate-800 dark:text-waify-dark-text-muted", children: item.a })
    ] }, item.q);
  }) });
}
function Avatar({ name, size = 40 }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "flex flex-shrink-0 items-center justify-center rounded-full bg-waify-green/15 font-bold text-waify-green-dark",
      style: { width: size, height: size, fontSize: Math.max(10, size / 3) },
      children: initials
    }
  );
}
function MarketingLogoCloud() {
  const items = integrations.slice(0, 8);
  const row = [...items, ...items];
  return /* @__PURE__ */ jsxs("section", { className: "overflow-hidden border-y border-gray-100 bg-white/50 py-10 dark:border-slate-800 dark:bg-slate-900/50", children: [
    /* @__PURE__ */ jsx("p", { className: "mb-6 text-center text-xs font-semibold uppercase tracking-widest text-waify-text-muted", children: "Built around the integrations available in Zyptos" }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent dark:from-slate-900" }),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-900" }),
      /* @__PURE__ */ jsx("div", { className: "mkt-marquee flex items-center gap-12", children: row.map((item, index) => /* @__PURE__ */ jsx("span", { className: "flex whitespace-nowrap px-4 text-lg font-bold text-gray-400 dark:text-slate-500 sm:text-xl", children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(ProviderLogo, { id: item.providerId, name: item.name, className: "h-9 w-9 rounded-lg", imageClassName: "h-5 w-5" }),
        item.name
      ] }) }, `${item.name}-${index}`)) })
    ] })
  ] });
}
function MarketingIntegrationsShowcase({ compact = false }) {
  const visible = compact ? integrations.slice(0, 8) : integrations;
  return /* @__PURE__ */ jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: visible.map((item) => /* @__PURE__ */ jsx(Card, { className: "mkt-card-lift p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(ProviderLogo, { id: item.providerId, name: item.name, className: "h-11 w-11 rounded-xl" }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: item.name }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: item.desc })
    ] })
  ] }) }, item.name)) });
}
function ProductPreview({ children }) {
  return /* @__PURE__ */ jsxs(Card, { className: "min-h-[280px] overflow-hidden p-0 shadow-pop ring-1 ring-gray-100 dark:ring-slate-700", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex h-9 items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 dark:border-slate-700 dark:bg-slate-800", children: [
      /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-red-400" }),
      /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-amber-400" }),
      /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-emerald-400" }),
      /* @__PURE__ */ jsx("span", { className: "ml-2 font-mono text-[10px] text-waify-text-muted", children: "app.zyptos.com" })
    ] }),
    children
  ] });
}
export {
  Avatar as A,
  MarketingSiteNav as M,
  ProductPreview as P,
  SeoHead as S,
  MarketingIcon as a,
  MarketingLogoCloud as b,
  MarketingFaqAccordion as c,
  MarketingSiteFooter as d,
  MarketingWhatsAppFloater as e,
  MarketingLayout as f,
  MarketingIntegrationsShowcase as g,
  integrations as i,
  knowledgeBaseGuides as k,
  marketingFaq as m,
  roadmapItems as r
};
