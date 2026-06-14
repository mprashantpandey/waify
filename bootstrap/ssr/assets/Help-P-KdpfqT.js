import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Search, BookOpen, Rocket, MessageCircle, FileText, Workflow, CreditCard, PlugZap, LifeBuoy, ChevronUp, ChevronDown, Video, Users } from "lucide-react";
import { f as MarketingLayout } from "./Marketing-xvuXbqSy.js";
import { c as cn } from "./utils-B2ZNUmII.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import "./BrandingWrapper-CZn0jBQL.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./ProviderLogo-DiN8H8HE.js";
import "clsx";
import "tailwind-merge";
const categories = [
  { id: "all", label: "All topics", icon: BookOpen },
  { id: "getting-started", label: "Getting started", icon: Rocket },
  { id: "campaigns", label: "Campaigns", icon: MessageCircle },
  { id: "templates", label: "Templates & Meta", icon: FileText },
  { id: "automation", label: "Automation", icon: Workflow },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: PlugZap },
  { id: "mobile", label: "Mobile & alerts", icon: LifeBuoy }
];
const articles = [
  { id: "h1", category: "getting-started", title: "Connect your WhatsApp Business API", excerpt: "Link one WABA number to a workspace using embedded signup, coexistence where eligible, or QR unofficial mode.", steps: ["Confirm Meta Business access and WABA permission.", "Connect one number to the workspace.", "Sync templates and check webhook diagnostics.", "Send a test message before campaign traffic."] },
  { id: "h2", category: "campaigns", title: "Send your first broadcast campaign", excerpt: "Choose contacts, segments, templates, schedule time, preview recipients, and retry failed sends.", steps: ["Import or segment opted-in contacts.", "Select an approved template and media if needed.", "Preview recipients and excluded contacts.", "After sending, retry only failed recipients."] },
  { id: "h3", category: "templates", title: "Why was my template rejected?", excerpt: "Review Meta rejection reasons, examples, variable formatting, button rules, and resubmission.", steps: ["Open the rejected template and read Meta feedback.", "Fix category, language, examples, variables, or buttons.", "Avoid misleading offers or unsupported claims.", "Resubmit and wait for Meta review."] },
  { id: "h4", category: "automation", title: "Build a lead qualification flow", excerpt: "Use triggers, wait nodes, quick replies, tags, assignment, AI-agent replies, and human handoff.", steps: ["Start with one trigger and one clean journey.", "Use deterministic nodes for tags, waits, templates, and assignment.", "Use AI-agent nodes only where flexible replies are needed.", "Set pause, timeout, and handoff rules before publishing."] },
  { id: "h5", category: "billing", title: "Invoices, discounts, and payments", excerpt: "Create Zyptos invoices, apply promo codes, use bank/UPI or Razorpay one-time payment, and download GST invoice PDFs.", steps: ["Open billing and choose a plan cycle.", "Apply a promo code in checkout preview.", "Pay with Razorpay or create a bank/UPI invoice.", "Download the GST invoice after payment confirmation."] },
  { id: "h6", category: "getting-started", title: "Import contacts from CSV", excerpt: "Format phone numbers, map fields, apply tags, create segments, and validate before import.", steps: ["Use country-aware phone numbers.", "Map name, phone, email, tags, and custom fields.", "Review duplicate and invalid rows.", "Import in the background and confirm segment counts."] },
  { id: "h7", category: "integrations", title: "Use API keys and webhooks", excerpt: "Create workspace API credentials, inspect logs, and subscribe to delivery and automation events.", steps: ["Create workspace API keys as an owner/admin.", "Use scoped credentials and rotate when needed.", "Inspect request logs for failures.", "Replay eligible webhook events from logs."] },
  { id: "h8", category: "integrations", title: "Connect Meta Lead Forms", excerpt: "Use Facebook login to fetch real lead forms, map fields, auto-create contacts, and trigger follow-up automation.", steps: ["Connect Meta Leads from Integrations.", "Select the page and lead form.", "Map form fields to contact fields.", "Enable alerts and automation trigger for new leads."] },
  { id: "h9", category: "integrations", title: "Sync Google Sheets and Calendar", excerpt: "Use Google OAuth after enabling the required APIs in Google Cloud, then map rows, appointments, and reminders.", steps: ["Enable Sheets and Calendar APIs in Google Cloud.", "Connect Google from the workspace.", "Select the sheet or calendar.", "Review integration logs after every sync."] },
  { id: "h10", category: "mobile", title: "Enable browser and mobile notifications", excerpt: "Turn on in-app, sound, browser push, and mobile push alerts for new messages, assigned leads, failed automation, and calls.", steps: ["Allow browser notification permission.", "Set user notification preferences.", "Keep the queue worker and push service healthy.", "Test with a new inbound WhatsApp message."] },
  { id: "h11", category: "billing", title: "Cancel, void, or correct an invoice", excerpt: "Use platform billing tools to close stale unpaid invoices, approve payment proof, or correct customer billing details before payment.", steps: ["Find the invoice in platform transactions.", "Void stale unpaid invoices when needed.", "Update billing profile before creating a new invoice.", "Keep paid invoices immutable for audit history."] }
];
function Help() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const filtered = useMemo(() => {
    return articles.filter((article) => {
      if (category !== "all" && article.category !== category) return false;
      const haystack = `${article.title} ${article.excerpt}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
  }, [category, query]);
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "help", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "Help Center" }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1120px] space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-[28px] border border-gray-100 bg-waify-green-soft/80 px-5 py-10 text-center shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-green-soft", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-green-dark dark:text-emerald-300", children: "Help Center" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text md:text-4xl", children: "How can we help?" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "Search guides, tutorials, and answers for WhatsApp setup, campaigns, templates, automation, billing, integrations, alerts, and mobile workflows." }),
        /* @__PURE__ */ jsxs("div", { className: "relative mx-auto mt-6 max-w-xl", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "search",
              value: query,
              onChange: (event) => setQuery(event.target.value),
              placeholder: "Search help articles...",
              className: "h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm text-waify-text outline-none transition focus:border-waify-green focus:ring-4 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-5 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(Card, { className: "h-fit p-3", children: /* @__PURE__ */ jsx("nav", { className: "space-y-1", children: categories.map((item) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setCategory(item.id),
            className: cn(
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition",
              category === item.id ? "bg-waify-green-soft font-semibold text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200" : "text-waify-text-muted hover:bg-gray-50 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2"
            ),
            children: [
              /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }),
              item.label
            ]
          },
          item.id
        )) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 lg:col-span-3", children: [
          filtered.length === 0 && /* @__PURE__ */ jsx(Card, { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No articles found. Try a different search term or category." }),
          filtered.map((article) => /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden p-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setExpanded(expanded === article.id ? null : article.id),
                className: "flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-gray-50/70 dark:hover:bg-waify-dark-surface-2/70",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-waify-green-soft text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "block font-semibold text-waify-text dark:text-waify-dark-text", children: article.title }),
                    /* @__PURE__ */ jsx("span", { className: "mt-1 line-clamp-1 block text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: article.excerpt }),
                    /* @__PURE__ */ jsx("span", { className: "mt-2 inline-flex rounded-full bg-waify-green-soft px-2 py-1 text-[11px] font-medium text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: "Available in app" })
                  ] }),
                  expanded === article.id ? /* @__PURE__ */ jsx(ChevronUp, { className: "mt-1 h-4 w-4 text-waify-text-muted" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "mt-1 h-4 w-4 text-waify-text-muted" })
                ]
              }
            ),
            expanded === article.id && /* @__PURE__ */ jsxs("div", { className: "border-t border-gray-100 px-5 pb-4 pt-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsx("ol", { className: "space-y-2 pl-14 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: article.steps.map((step, stepIndex) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-waify-green/10 text-[11px] font-semibold text-waify-green-dark", children: stepIndex + 1 }),
                /* @__PURE__ */ jsx("span", { children: step })
              ] }, step)) }),
              /* @__PURE__ */ jsxs("div", { className: "mt-3 flex gap-2 pl-14", children: [
                /* @__PURE__ */ jsx(Button, { variant: "secondary", children: "Helpful" }),
                /* @__PURE__ */ jsx(Link, { href: route("login"), children: /* @__PURE__ */ jsx(Button, { variant: "ghost", children: "Open in app" }) })
              ] })
            ] })
          ] }, article.id))
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: [
        { icon: Video, title: "Video tutorials", desc: "Short walkthroughs for key workflows.", color: "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-100" },
        { icon: Users, title: "Implementation help", desc: "Get guidance for onboarding and setup.", color: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-100" },
        { icon: LifeBuoy, title: "Support desk", desc: "Create a ticket from your workspace.", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100" }
      ].map((item) => /* @__PURE__ */ jsxs(Card, { className: "flex items-start gap-3 p-4", children: [
        /* @__PURE__ */ jsx("span", { className: cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.color), children: /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: item.title }),
          /* @__PURE__ */ jsx("span", { className: "mt-1 block text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: item.desc })
        ] })
      ] }, item.title)) }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-[28px] bg-waify-ink p-8 text-center dark:bg-black", children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "mx-auto mb-4 h-7 w-7 text-waify-green" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-white", children: "Still need help?" }),
        /* @__PURE__ */ jsx("p", { className: "mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300", children: "Share your workspace, Meta app, WABA, billing, or API issue and we will route it to the right team." }),
        /* @__PURE__ */ jsx(Link, { href: route("contact"), children: /* @__PURE__ */ jsx(Button, { className: "mt-6", children: "Contact support" }) })
      ] })
    ] })
  ] });
}
export {
  Help as default
};
