import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-DvEO1iV9.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { E as EmptyState } from "./EmptyState-B0nbB491.js";
import { FileText, RefreshCw, Filter, Search, X, Check, Copy, Globe, Tag, Zap, Send, Archive, Trash2 } from "lucide-react";
import { useState } from "react";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { u as useToast } from "./useToast-C5ECijgs.js";
import { u as useConfirm } from "./useConfirm-BKf7Nv1N.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-gMSPY3wx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function TemplatesIndex({
  account,
  templates,
  connections,
  filters
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);
  const [copied, setCopied] = useState(null);
  const [archiving, setArchiving] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const applyFilters = () => {
    router.get(route("app.whatsapp.templates.index", {}), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const clearFilters = () => {
    const emptyFilters = {
      connection: "",
      status: "",
      category: "",
      language: "",
      search: ""
    };
    setLocalFilters(emptyFilters);
    router.get(route("app.whatsapp.templates.index", {}), emptyFilters);
  };
  const copyTemplateName = (name, language) => {
    const fullName = `${name}:${language}`;
    navigator.clipboard.writeText(fullName);
    setCopied(fullName);
    toast.success("Template name copied");
    setTimeout(() => setCopied(null), 2e3);
  };
  const syncTemplates = () => {
    router.post(route("app.whatsapp.templates.sync", {}), {
      connection_id: localFilters.connection || connections[0]?.id
    }, {
      onSuccess: () => {
        toast.success("Templates synced successfully");
        router.reload({ only: ["templates"] });
      },
      onError: () => {
        toast.error("Failed to sync templates");
      }
    });
  };
  const handleArchive = async (template) => {
    const confirmed = await confirm({
      title: "Archive Template",
      message: `Are you sure you want to archive "${template.name}"? You can restore it later.`,
      variant: "warning"
    });
    if (!confirmed) return;
    setArchiving(template.slug);
    router.post(
      route("app.whatsapp.templates.archive", {
        template: template.slug
      }),
      {},
      {
        onSuccess: () => {
          toast.success("Template archived successfully");
          router.reload({ only: ["templates"] });
        },
        onError: () => {
          toast.error("Failed to archive template");
        },
        onFinish: () => setArchiving(null)
      }
    );
  };
  const handleDelete = async (template) => {
    const confirmed = await confirm({
      title: "Delete Template",
      message: `Are you sure you want to permanently delete "${template.name}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete"
    });
    if (!confirmed) return;
    setDeleting(template.slug);
    router.delete(
      route("app.whatsapp.templates.destroy", {
        template: template.slug
      }),
      {
        onSuccess: () => {
          toast.success("Template deleted successfully");
          router.reload({ only: ["templates"] });
        },
        onError: () => {
          toast.error("Failed to delete template");
        },
        onFinish: () => setDeleting(null)
      }
    );
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { variant: "success", label: "Approved" },
      pending: { variant: "warning", label: "Pending" },
      rejected: { variant: "danger", label: "Rejected" },
      paused: { variant: "default", label: "Paused" },
      disabled: { variant: "default", label: "Disabled" }
    };
    const config = statusMap[status.toLowerCase()] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, className: "px-3 py-1", children: config.label });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Message Templates" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Message Templates" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Manage your WhatsApp message templates" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("app.whatsapp.templates.create", {}),
              children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 mr-2" }),
                "Create Template"
              ] })
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: syncTemplates,
              variant: "secondary",
              className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                "Sync from Meta"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-lg font-bold", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }),
            "Filters"
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setShowFilters(!showFilters),
              className: "text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors",
              children: [
                showFilters ? "Hide" : "Show",
                " Filters"
              ]
            }
          )
        ] }) }),
        showFilters && /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2", children: "Search" }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    value: localFilters.search,
                    onChange: (e) => setLocalFilters({ ...localFilters, search: e.target.value }),
                    onKeyDown: (e) => e.key === "Enter" && applyFilters(),
                    className: "pl-10 rounded-xl",
                    placeholder: "Search templates..."
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2", children: "Connection" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: localFilters.connection,
                  onChange: (e) => setLocalFilters({ ...localFilters, connection: e.target.value }),
                  className: "w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Connections" }),
                    connections.map((conn) => /* @__PURE__ */ jsx("option", { value: conn.id.toString(), children: conn.name }, conn.id))
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2", children: "Status" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: localFilters.status,
                  onChange: (e) => setLocalFilters({ ...localFilters, status: e.target.value }),
                  className: "w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
                    /* @__PURE__ */ jsx("option", { value: "approved", children: "Approved" }),
                    /* @__PURE__ */ jsx("option", { value: "pending", children: "Pending" }),
                    /* @__PURE__ */ jsx("option", { value: "rejected", children: "Rejected" }),
                    /* @__PURE__ */ jsx("option", { value: "paused", children: "Paused" }),
                    /* @__PURE__ */ jsx("option", { value: "disabled", children: "Disabled" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2", children: "Category" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: localFilters.category,
                  onChange: (e) => setLocalFilters({ ...localFilters, category: e.target.value }),
                  className: "w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: "All Categories" }),
                    /* @__PURE__ */ jsx("option", { value: "MARKETING", children: "Marketing" }),
                    /* @__PURE__ */ jsx("option", { value: "UTILITY", children: "Utility" }),
                    /* @__PURE__ */ jsx("option", { value: "AUTHENTICATION", children: "Authentication" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-6", children: [
            /* @__PURE__ */ jsx(Button, { onClick: applyFilters, className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50 rounded-xl", children: "Apply Filters" }),
            /* @__PURE__ */ jsxs(Button, { onClick: clearFilters, variant: "secondary", className: "rounded-xl", children: [
              /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-2" }),
              "Clear"
            ] })
          ] })
        ] })
      ] }),
      templates.data.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-xl", children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsx(
        EmptyState,
        {
          icon: FileText,
          title: "No templates found",
          description: "Sync templates from Meta to import your WhatsApp message templates.",
          action: /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: syncTemplates,
              className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                "Sync Templates"
              ]
            }
          )
        }
      ) }) }) : /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Template" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Language" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Category" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Variables" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Connection" }),
          /* @__PURE__ */ jsx("th", { className: "px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: templates.data.map((template) => /* @__PURE__ */ jsxs(
          "tr",
          {
            className: "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/10 dark:hover:to-blue-800/10 transition-all duration-200",
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg", children: /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4 text-white" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: template.name }),
                  template.body_text && /* @__PURE__ */ jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs mt-0.5", children: [
                    template.body_text.substring(0, 60),
                    template.body_text.length > 60 ? "..." : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => copyTemplateName(template.name, template.language),
                    className: "p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    children: copied === `${template.name}:${template.language}` ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 text-green-600 dark:text-green-400" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 text-gray-400" })
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Globe, { className: "h-3.5 w-3.5 text-gray-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300 font-medium", children: template.language })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "px-3 py-1", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-3 w-3 mr-1" }),
                template.category
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(template.status) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: template.variable_count > 0 ? /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "px-3 py-1", children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 mr-1" }),
                template.variable_count
              ] }) : /* @__PURE__ */ jsx("span", { className: "text-gray-400 text-sm", children: "—" }) }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400", children: template.connection.name }),
              /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.whatsapp.templates.show", {
                      template: template.slug
                    }),
                    children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "rounded-lg", children: "View" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("app.whatsapp.templates.send", {
                      template: template.slug
                    }),
                    children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg", children: [
                      /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-1" }),
                      "Send"
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20",
                    onClick: () => handleArchive(template),
                    disabled: archiving === template.slug,
                    children: /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "sm",
                    className: "rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                    onClick: () => handleDelete(template),
                    disabled: deleting === template.slug,
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] }) })
            ]
          },
          template.id
        )) })
      ] }) }) }) })
    ] })
  ] });
}
export {
  TemplatesIndex as default
};
