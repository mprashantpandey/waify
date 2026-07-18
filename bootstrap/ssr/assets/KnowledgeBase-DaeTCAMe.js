import { jsxs, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { Search, CheckCircle2 } from "lucide-react";
import { k as knowledgeBaseGuides, f as MarketingLayout, g as MarketingIntegrationsShowcase } from "./Marketing-DVQdzdv4.js";
import { C as Card } from "./Card-BtIXZ0GS.js";
import "./BrandingWrapper-DdVUILzh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "./CookieConsentBanner-X10ew4Dy.js";
import "./Button-BJftGNki.js";
import "./ProviderLogo-1eHVtujo.js";
function KnowledgeBase() {
  const [query, setQuery] = useState("");
  const guides = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return knowledgeBaseGuides;
    return knowledgeBaseGuides.filter((guide) => {
      const haystack = `${guide.category} ${guide.title} ${guide.summary} ${guide.bullets.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);
  return /* @__PURE__ */ jsxs(MarketingLayout, { page: "knowledgebase", wide: true, children: [
    /* @__PURE__ */ jsx(Head, { title: "Knowledge Base" }),
    /* @__PURE__ */ jsxs("div", { className: "relative mb-8", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-waify-text-muted" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "search",
          value: query,
          onChange: (event) => setQuery(event.target.value),
          placeholder: "Search setup, billing, campaigns, integrations...",
          className: "h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-waify-green focus:ring-4 focus:ring-waify-green/15 dark:border-waify-dark-border dark:bg-waify-dark-surface"
        }
      )
    ] }),
    guides.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "p-8 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "No guide matched your search. Try WhatsApp, billing, leads, campaign, automation, or security." }) : /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-2", children: guides.map((guide) => /* @__PURE__ */ jsxs(Card, { className: "mkt-card-lift p-5", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-3 inline-flex rounded-full bg-waify-green-soft px-2.5 py-1 text-[11px] font-semibold text-waify-green-dark dark:bg-waify-dark-green-soft dark:text-emerald-200", children: guide.category }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: guide.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: guide.summary }),
      /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2", children: guide.bullets.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-waify-green" }),
        /* @__PURE__ */ jsx("span", { children: item })
      ] }, item)) }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-xs font-medium text-waify-green-dark", children: "Detailed actions are available inside the relevant workspace screen." })
    ] }, guide.title)) }),
    /* @__PURE__ */ jsxs(Card, { className: "mt-6 p-5", children: [
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "What this knowledge base is for" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted", children: "These guides describe the current Zyptos product behavior. For workspace-specific data, open the app screen because permissions, connected WABA state, enabled modules, plan limits, and integration health can differ by workspace." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-waify-text dark:text-waify-dark-text", children: "Integration guides by provider" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "These are the real provider integrations currently represented in Zyptos, with workspace setup and troubleshooting available in the app." })
      ] }),
      /* @__PURE__ */ jsx(MarketingIntegrationsShowcase, {})
    ] })
  ] });
}
export {
  KnowledgeBase as default
};
