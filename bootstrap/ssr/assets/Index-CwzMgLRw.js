import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-COfIDu4w.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent, d as CardDescription } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { I as Input } from "./Input-B0lHg7LA.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { Search, FileText, Building2, Eye, XCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./useToast-DNfJQ6ZA.js";
import "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "axios";
function TemplatesIndex({
  templates,
  filters,
  filter_options
}) {
  const { auth } = usePage().props;
  const [localFilters, setLocalFilters] = useState(filters);
  const applyFilters = () => {
    router.get(route("platform.templates.index"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { variant: "success", icon: CheckCircle },
      PENDING: { variant: "warning", icon: Clock },
      REJECTED: { variant: "danger", icon: XCircle }
    };
    const config = statusMap[status] || { variant: "default", icon: AlertCircle };
    const Icon = config.icon;
    return /* @__PURE__ */ jsxs(Badge, { variant: config.variant, className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3" }),
      status
    ] });
  };
  return /* @__PURE__ */ jsxs(PlatformShell, { auth, children: [
    /* @__PURE__ */ jsx(Head, { title: "Templates" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Message Templates" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage and monitor templates across all tenants" })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Filters" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "search", children: "Search" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "search",
                  type: "text",
                  placeholder: "Search templates...",
                  value: localFilters.search || "",
                  onChange: (e) => setLocalFilters({ ...localFilters, search: e.target.value }),
                  className: "pl-10"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "filter-status", children: "Status" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "filter-status",
                value: localFilters.status || "",
                onChange: (e) => setLocalFilters({ ...localFilters, status: e.target.value || void 0 }),
                className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                  filter_options.statuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status }, status))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "filter-account", children: "Tenant" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "filter-account",
                value: localFilters.account_id || "",
                onChange: (e) => setLocalFilters({ ...localFilters, account_id: e.target.value || void 0 }),
                className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "All Tenants" }),
                  filter_options.accounts.map((account) => /* @__PURE__ */ jsx("option", { value: account.id, children: account.name }, account.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: applyFilters,
              className: "w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors",
              children: "Apply Filters"
            }
          ) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Templates" }),
          /* @__PURE__ */ jsxs(CardDescription, { children: [
            templates.total,
            " total templates"
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx(CardContent, { children: templates.data.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-12 w-12 mx-auto text-gray-400 mb-4" }),
          /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400", children: "No templates found" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full divide-y divide-gray-200 dark:divide-gray-800", children: [
            /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Template" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Tenant" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Status" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Category" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Language" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Last Synced" }),
              /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700", children: templates.data.map((template) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-700", children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: template.name }),
                template.last_meta_error && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: [
                  "Error: ",
                  template.last_meta_error
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("platform.accounts.show", { account: template.account.id }),
                  className: "flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline",
                  children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
                    template.account.name
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(template.status) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsx(Badge, { variant: "info", children: template.category }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: template.language }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: template.last_synced_at ? new Date(template.last_synced_at).toLocaleDateString() : "Never" }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("platform.templates.show", { template: template.slug }),
                  className: "text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
                    "View"
                  ]
                }
              ) })
            ] }, template.id)) })
          ] }) }),
          templates.last_page > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-700 dark:text-gray-300", children: [
              "Showing ",
              templates.per_page * (templates.current_page - 1) + 1,
              " to",
              " ",
              Math.min(templates.per_page * templates.current_page, templates.total),
              " of",
              " ",
              templates.total,
              " results"
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: templates.links.map((link, index) => link.url ? /* @__PURE__ */ jsx(
              Link,
              {
                href: link.url,
                className: `px-3 py-2 rounded-md text-sm ${link.active ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}`,
                dangerouslySetInnerHTML: { __html: link.label }
              },
              index
            ) : /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-3 py-2 rounded-md text-sm opacity-50 cursor-not-allowed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                dangerouslySetInnerHTML: { __html: link.label }
              },
              index
            )) })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  TemplatesIndex as default
};
