import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState, useMemo } from "react";
import { P as PlatformShell } from "./PlatformShell-BJ42joc8.js";
import { C as Card, a as CardContent } from "./Card-BtIXZ0GS.js";
import { B as Button } from "./Button-BJftGNki.js";
import { B as Badge } from "./Badge-C65MHc2S.js";
import { D as Drawer } from "./Elements-EbyZDnT_.js";
import { Search, Filter, MessageSquareText, ShieldAlert, Eye, Building2, Languages, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { c as cn } from "./utils-B2ZNUmII.js";
import "axios";
import "./BrandingWrapper-DdVUILzh.js";
import "./BrandLogo-TeztHB0m.js";
import "./useToast-BN7qsQL3.js";
import "@headlessui/react";
import "clsx";
import "tailwind-merge";
function normalizeStatus(status) {
  return (status || "UNKNOWN").toUpperCase();
}
function statusVariant(status) {
  const normalized = normalizeStatus(status);
  if (normalized === "APPROVED") return "success";
  if (normalized === "PENDING" || normalized === "IN_REVIEW") return "warning";
  if (normalized === "REJECTED" || normalized === "PAUSED" || normalized === "DISABLED") return "danger";
  return "default";
}
function statusIcon(status) {
  const normalized = normalizeStatus(status);
  if (normalized === "APPROVED") return CheckCircle2;
  if (normalized === "PENDING" || normalized === "IN_REVIEW") return Clock;
  if (normalized === "REJECTED" || normalized === "PAUSED" || normalized === "DISABLED") return XCircle;
  return AlertCircle;
}
function plainPaginationLabel(label) {
  return label.replace("&laquo;", "Prev").replace("&raquo;", "Next");
}
function formatDate(value) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
function replaceVariables(value) {
  return (value || "").replace(/\{\{(\d+)\}\}/g, (_match, number) => `Sample ${number}`);
}
function templateButtons(template) {
  const rawButtons = template.buttons || template.components?.find?.((component) => component.type === "BUTTONS")?.buttons || [];
  return Array.isArray(rawButtons) ? rawButtons : [];
}
function TemplatePhonePreview({ template }) {
  const buttons = templateButtons(template);
  const body = replaceVariables(template.body_text) || "No body text stored.";
  return /* @__PURE__ */ jsx("div", { className: "rounded-[28px] border border-gray-200 bg-gray-950 p-3 shadow-card dark:border-waify-dark-border", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-[22px] bg-[#e6ddd4]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-[#075e54] px-4 py-3 text-white", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold", children: template.account.name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold", children: template.account.name }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-white/75", children: "WhatsApp Business preview" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 px-3 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-[86%] rounded-lg rounded-tl-sm bg-white px-3 py-2 text-sm leading-relaxed text-gray-900 shadow-sm", children: [
        template.header_text && /* @__PURE__ */ jsx("p", { className: "mb-2 font-semibold", children: replaceVariables(template.header_text) }),
        /* @__PURE__ */ jsx("p", { className: "whitespace-pre-wrap", children: body }),
        template.footer_text && /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-gray-500", children: replaceVariables(template.footer_text) }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-right text-[10px] text-gray-400", children: "10:42" })
      ] }),
      buttons.length > 0 && /* @__PURE__ */ jsx("div", { className: "max-w-[86%] space-y-1", children: buttons.slice(0, 3).map((button, index) => /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-white px-3 py-2 text-center text-xs font-semibold text-sky-600 shadow-sm", children: button.text || button.type || `Button ${index + 1}` }, `${button.text || button.type || "button"}-${index}`)) })
    ] })
  ] }) });
}
function InfoBanner() {
  return /* @__PURE__ */ jsx("div", { className: "rounded-card border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-100", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(FileText, { className: "mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-200" }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Review Meta template submissions across workspaces." }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-sky-700 dark:text-sky-200/80", children: "This admin view is read-only oversight. Creation, sync, and Meta approval still happen from each workspace WABA flow." })
    ] })
  ] }) });
}
function StatCard({ label, value, variant }) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs font-medium uppercase tracking-[0.12em] text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
    /* @__PURE__ */ jsx("div", { className: "mt-2 text-2xl font-bold tabular-nums text-waify-text dark:text-waify-dark-text", children: value }),
    /* @__PURE__ */ jsx(Badge, { variant, className: "mt-2", children: "This page" })
  ] }) });
}
function TemplatesIndex({
  templates,
  filters,
  filter_options,
  selectedTemplate
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState(filters || {});
  const selected = selectedTemplate || null;
  const stats = useMemo(() => {
    const approved = templates.data.filter((template) => normalizeStatus(template.status) === "APPROVED").length;
    const pending = templates.data.filter((template) => ["PENDING", "IN_REVIEW"].includes(normalizeStatus(template.status))).length;
    const rejected = templates.data.filter((template) => ["REJECTED", "PAUSED", "DISABLED"].includes(normalizeStatus(template.status))).length;
    return { approved, pending, rejected };
  }, [templates.data]);
  const applyFilters = (next = localFilters) => {
    router.get(route("platform.templates.index"), next, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const setStatus = (status) => {
    const next = { ...localFilters, status };
    setLocalFilters(next);
    applyFilters(next);
  };
  const clearFilters = () => {
    setLocalFilters({});
    router.get(route("platform.templates.index"), {}, { preserveState: true, preserveScroll: true, replace: true });
  };
  const openTemplate = (template) => {
    router.get(route("platform.templates.index"), { ...localFilters, template: template.slug }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const closeTemplate = () => {
    router.get(route("platform.templates.index"), localFilters, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const statusFilters = [
    { id: void 0, label: "All" },
    { id: "APPROVED", label: "Approved" },
    { id: "PENDING", label: "Pending" },
    { id: "REJECTED", label: "Rejected" }
  ];
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Templates" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsx(InfoBanner, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: statusFilters.map((status) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setStatus(status.id),
            className: cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition",
              (localFilters.status || void 0) === status.id ? "bg-waify-green text-white shadow-sm" : "bg-gray-100 text-waify-text-muted hover:bg-gray-200 dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted dark:hover:bg-slate-700"
            ),
            children: status.label
          },
          status.label
        )) }),
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", onClick: clearFilters, children: "Reset filters" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-w-md", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted dark:text-waify-dark-text-muted" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: localFilters.search || "",
            onChange: (event) => setLocalFilters({ ...localFilters, search: event.target.value || void 0 }),
            onKeyDown: (event) => {
              if (event.key === "Enter") applyFilters();
            },
            placeholder: "Search template or workspace...",
            className: "h-10 w-full rounded-btn border border-waify-border bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx(StatCard, { label: "Pending review", value: stats.pending, variant: "warning" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Approved", value: stats.approved, variant: "success" }),
        /* @__PURE__ */ jsx(StatCard, { label: "Needs attention", value: stats.rejected, variant: "danger" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: localFilters.account_id || "",
            onChange: (event) => setLocalFilters({ ...localFilters, account_id: event.target.value || void 0 }),
            className: "waify-input min-w-48",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All workspaces" }),
              filter_options.accounts.map((account) => /* @__PURE__ */ jsx("option", { value: account.id, children: account.name }, account.id))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: localFilters.status || "",
            onChange: (event) => setLocalFilters({ ...localFilters, status: event.target.value || void 0 }),
            className: "waify-input min-w-40",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All statuses" }),
              filter_options.statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: normalizeStatus(status) }, status))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Button, { type: "button", onClick: () => applyFilters(), children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }),
          "Apply"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "overflow-hidden", children: templates.data.length === 0 ? /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center py-16 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-card bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(MessageSquareText, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "No templates found" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Change filters or sync templates from a workspace WABA account." })
      ] }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-gray-50/60 text-left text-xs uppercase text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2/40 dark:text-waify-dark-text-muted", children: [
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Template" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Workspace" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Category" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Language" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3", children: "Synced" }),
          /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100 dark:divide-waify-dark-border", children: templates.data.map((template) => {
          const Icon = statusIcon(template.status);
          return /* @__PURE__ */ jsxs("tr", { className: "text-waify-text hover:bg-gray-50/60 dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2/40", children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-btn bg-emerald-50 text-waify-green dark:bg-emerald-400/10 dark:text-emerald-200", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "max-w-[260px] truncate font-mono text-xs font-semibold", children: template.name }),
                template.last_meta_error && /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-300", children: [
                  /* @__PURE__ */ jsx(ShieldAlert, { className: "h-3.5 w-3.5" }),
                  "Meta error"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-5 py-3", children: [
              /* @__PURE__ */ jsx(Link, { href: route("platform.accounts.show", { account: template.account.id }), className: "font-medium text-waify-green-dark hover:underline dark:text-emerald-300", children: template.account.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: template.account.slug })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: template.category }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 uppercase text-waify-text-muted dark:text-waify-dark-text-muted", children: template.language }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsx(Badge, { variant: statusVariant(template.status), children: normalizeStatus(template.status) }) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3 text-waify-text-muted dark:text-waify-dark-text-muted", children: formatDate(template.last_synced_at) }),
            /* @__PURE__ */ jsx("td", { className: "px-5 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "ghost", type: "button", onClick: () => openTemplate(template), children: [
                /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                "Inspect"
              ] }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", type: "button", onClick: () => openTemplate(template), children: "Open" })
            ] }) })
          ] }, template.id);
        }) })
      ] }) }) }),
      templates.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: [
          "Showing ",
          templates.per_page * (templates.current_page - 1) + 1,
          " to ",
          Math.min(templates.per_page * templates.current_page, templates.total),
          " of ",
          templates.total
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: templates.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(
          Link,
          {
            href: link.url,
            className: cn(
              "h-9 rounded-btn px-3 py-2 text-sm font-semibold transition",
              link.active ? "bg-waify-green text-white" : "border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2"
            ),
            children: plainPaginationLabel(link.label)
          },
          `${link.label}-${index}`
        ) : /* @__PURE__ */ jsx(
          "span",
          {
            className: "h-9 rounded-btn border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-semibold text-waify-text-muted opacity-60 dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted",
            children: plainPaginationLabel(link.label)
          },
          `${link.label}-${index}`
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      Drawer,
      {
        open: !!selected,
        onClose: closeTemplate,
        title: selected?.name || "Template",
        description: selected ? `${selected.account.name} · ${normalizeStatus(selected.status)}` : void 0,
        footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", type: "button", onClick: closeTemplate, children: "Close" }),
          selected && /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => router.visit(route("platform.accounts.show", { account: selected.account.id })), children: "Open workspace" })
        ] }),
        children: selected && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(TemplatePhonePreview, { template: selected }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx(Badge, { variant: statusVariant(selected.status), children: normalizeStatus(selected.status) }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: selected.category })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
              "Quality: ",
              selected.quality_score || "Not reported",
              " · Synced ",
              formatDate(selected.last_synced_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
            selected.header_text && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Header" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 whitespace-pre-wrap text-waify-text dark:text-waify-dark-text", children: selected.header_text })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Body" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 whitespace-pre-wrap text-waify-text dark:text-waify-dark-text", children: selected.body_text || "No body text stored." })
            ] }),
            selected.footer_text && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-white p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Footer" }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 whitespace-pre-wrap text-waify-text dark:text-waify-dark-text", children: selected.footer_text })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
                " Workspace"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selected.account.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-3 dark:border-waify-dark-border", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2 text-waify-text-muted dark:text-waify-dark-text-muted", children: [
                /* @__PURE__ */ jsx(Languages, { className: "h-4 w-4" }),
                " Language"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-medium uppercase text-waify-text dark:text-waify-dark-text", children: selected.language })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-waify-text-muted dark:text-waify-dark-text-muted", children: "Connection" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-waify-text dark:text-waify-dark-text", children: selected.connection?.name || "Not linked" })
            ] })
          ] }),
          selected.buttons && Array.isArray(selected.buttons) && selected.buttons.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-gray-100 bg-gray-50 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Buttons" }),
            /* @__PURE__ */ jsx("pre", { className: "mt-2 max-h-48 overflow-auto text-xs text-waify-text dark:text-waify-dark-text", children: JSON.stringify(selected.buttons, null, 2) })
          ] }),
          selected.last_meta_error && /* @__PURE__ */ jsx("div", { className: "rounded-card border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-400/25 dark:bg-red-500/10 dark:text-red-200", children: selected.last_meta_error })
        ] })
      }
    )
  ] });
}
export {
  TemplatesIndex as default
};
