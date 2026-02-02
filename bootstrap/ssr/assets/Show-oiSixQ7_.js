import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { ArrowLeft, Globe, Tag, FileText, Edit, RefreshCw, Send, Archive, Trash2, AlertCircle, Sparkles, Clock } from "lucide-react";
import { A as Alert } from "./Alert-D7z82-LQ.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { u as useConfirm } from "./useConfirm-94UId2r4.js";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function TemplatesShow({
  workspace,
  template
}) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const handleCheckStatus = () => {
    router.post(
      route("app.whatsapp.templates.check-status", {
        workspace: workspace.slug,
        template: template.slug
      }),
      {},
      {
        onSuccess: () => {
          toast.success("Template status updated from Meta");
          router.reload({ only: ["template"] });
        },
        onError: (errors) => {
          toast.error(errors?.message || "Failed to check template status");
        }
      }
    );
  };
  const handleArchive = async () => {
    const confirmed = await confirm({
      title: "Archive Template",
      message: `Are you sure you want to archive "${template.name}"? You can restore it later.`,
      variant: "warning"
    });
    if (!confirmed) return;
    router.post(
      route("app.whatsapp.templates.archive", {
        workspace: workspace.slug,
        template: template.slug
      }),
      {},
      {
        onSuccess: () => {
          toast.success("Template archived successfully");
          router.visit(route("app.whatsapp.templates.index", { workspace: workspace.slug }));
        },
        onError: () => {
          toast.error("Failed to archive template");
        }
      }
    );
  };
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Template",
      message: `Are you sure you want to permanently delete "${template.name}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete"
    });
    if (!confirmed) return;
    router.delete(
      route("app.whatsapp.templates.destroy", {
        workspace: workspace.slug,
        template: template.slug
      }),
      {
        onSuccess: () => {
          toast.success("Template deleted successfully");
          router.visit(route("app.whatsapp.templates.index", { workspace: workspace.slug }));
        },
        onError: () => {
          toast.error("Failed to delete template");
        }
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
    /* @__PURE__ */ jsx(Head, { title: `${template.name} - Template` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.templates.index", { workspace: workspace.slug }),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Templates"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2", children: [
              template.name,
              getStatusBadge(template.status)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
                template.language
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4" }),
                template.category
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
                template.connection.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.whatsapp.templates.edit", {
                  workspace: workspace.slug,
                  template: template.slug
                }),
                children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", children: [
                  /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                  "Edit"
                ] })
              }
            ),
            template.meta_template_id && /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "secondary",
                onClick: handleCheckStatus,
                children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                  "Check Status"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.whatsapp.templates.send", {
                  workspace: workspace.slug,
                  template: template.slug
                }),
                children: /* @__PURE__ */ jsxs(Button, { className: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50", children: [
                  /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
                  "Send Template"
                ] })
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "secondary",
                onClick: handleArchive,
                className: "text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20",
                children: [
                  /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4 mr-2" }),
                  "Archive"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "secondary",
                onClick: handleDelete,
                className: "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                  "Delete"
                ]
              }
            )
          ] })
        ] })
      ] }),
      template.rejection_reason && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Rejection Reason" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: template.rejection_reason })
        ] })
      ] }),
      template.last_meta_error && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Meta Error" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: template.last_meta_error })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Template Preview" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "How your template will appear to recipients" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-6", children: [
          template.header_type && template.header_text && /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "px-2 py-1 text-xs", children: [
              "Header (",
              template.header_type,
              ")"
            ] }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: template.header_text })
          ] }),
          template.body_text && /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "default", className: "px-2 py-1 text-xs", children: "Body" }),
              template.variable_count > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "px-2 py-1 text-xs", children: [
                template.variable_count,
                " variables"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed", children: template.body_text })
          ] }),
          template.footer_text && /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsx(Badge, { variant: "default", className: "px-2 py-1 text-xs", children: "Footer" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: template.footer_text })
          ] }),
          template.has_buttons && template.buttons.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsx(Badge, { variant: "default", className: "px-2 py-1 text-xs", children: "Buttons" }) }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: template.buttons.map((button, index) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between hover:shadow-md transition-shadow",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-gray-100", children: button.text }),
                  /* @__PURE__ */ jsx(Badge, { variant: "info", className: "px-3 py-1", children: button.type })
                ]
              },
              index
            )) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Template Details" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Metadata and sync information" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("dl", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: template.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Language" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: template.language })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Category" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: template.category })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Status" }),
            /* @__PURE__ */ jsx("dd", { children: getStatusBadge(template.status) })
          ] }),
          template.quality_score && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Quality Score" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: template.quality_score })
          ] }),
          template.last_synced_at && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsxs("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
              "Last Synced"
            ] }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: new Date(template.last_synced_at).toLocaleString() })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  TemplatesShow as default
};
