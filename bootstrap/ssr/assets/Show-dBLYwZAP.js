import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Head, Link, router } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { ArrowLeft, Globe, Tag, FileText, Edit, Loader2, RefreshCw, Send, Archive, Trash2, AlertCircle, Sparkles, Clock } from "lucide-react";
import { A as Alert } from "./Alert-C-mQ6HNk.js";
import { u as useConfirm } from "./useConfirm-BKf7Nv1N.js";
import { useState, useEffect } from "react";
import { u as useRealtime } from "./RealtimeProvider-D1qLzQY9.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
import "laravel-echo";
import "pusher-js";
function TemplatesShow({
  account,
  template
}) {
  const confirm = useConfirm();
  const { subscribe } = useRealtime();
  const [liveTemplate, setLiveTemplate] = useState(template);
  const [actionState, setActionState] = useState(null);
  useEffect(() => {
    setLiveTemplate(template);
  }, [template]);
  const handleCheckStatus = () => {
    router.post(
      route("app.whatsapp.templates.check-status", {
        template: liveTemplate.slug
      }),
      {},
      {
        onStart: () => setActionState("check-status"),
        onSuccess: () => {
          router.reload({ only: ["template"] });
        },
        onError: () => {
        },
        onFinish: () => setActionState(null)
      }
    );
  };
  useEffect(() => {
    if (!account?.id) return;
    const channel = `account.${account.id}.whatsapp.templates`;
    const unsubscribe = subscribe(channel, ".whatsapp.template.status.updated", (data) => {
      const incoming = data?.template;
      if (!incoming) return;
      if (incoming.id !== liveTemplate.id && incoming.slug !== liveTemplate.slug) return;
      setLiveTemplate((prev) => ({
        ...prev,
        status: incoming.status ?? prev.status,
        last_meta_error: incoming.last_meta_error ?? prev.last_meta_error,
        rejection_reason: incoming.rejection_reason ?? prev.rejection_reason,
        last_synced_at: incoming.last_synced_at ?? prev.last_synced_at
      }));
    });
    return unsubscribe;
  }, [account?.id, liveTemplate.id, liveTemplate.slug, subscribe]);
  const handleArchive = async () => {
    const confirmed = await confirm({
      title: "Archive Template",
      message: `Are you sure you want to archive "${liveTemplate.name}"? You can restore it later.`,
      variant: "warning"
    });
    if (!confirmed) return;
    router.post(
      route("app.whatsapp.templates.archive", {
        template: liveTemplate.slug
      }),
      {},
      {
        onStart: () => setActionState("archive"),
        onSuccess: () => {
          router.visit(route("app.whatsapp.templates.index", {}));
        },
        onError: () => {
        },
        onFinish: () => setActionState(null)
      }
    );
  };
  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Template",
      message: `Are you sure you want to permanently delete "${liveTemplate.name}"? This action cannot be undone.`,
      variant: "danger",
      confirmText: "Delete"
    });
    if (!confirmed) return;
    router.delete(
      route("app.whatsapp.templates.destroy", {
        template: liveTemplate.slug
      }),
      {
        onStart: () => setActionState("delete"),
        onSuccess: () => {
          router.visit(route("app.whatsapp.templates.index", {}));
        },
        onError: () => {
        },
        onFinish: () => setActionState(null)
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
    /* @__PURE__ */ jsx(Head, { title: `${liveTemplate.name} - Template` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(
          Link,
          {
            href: route("app.whatsapp.templates.index", {}),
            className: "inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
              "Back to Templates"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2", children: [
              liveTemplate.name,
              getStatusBadge(liveTemplate.status)
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
                liveTemplate.language
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Tag, { className: "h-4 w-4" }),
                liveTemplate.category
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
                liveTemplate.connection.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-stretch sm:items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.whatsapp.templates.edit", {
                  template: liveTemplate.slug
                }),
                className: "w-full sm:w-auto",
                children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "w-full sm:w-auto", children: [
                  /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
                  "Edit"
                ] })
              }
            ),
            liveTemplate.meta_template_id && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: handleCheckStatus,
                disabled: actionState !== null,
                className: "w-full sm:w-auto",
                children: actionState === "check-status" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Checking..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                  "Check Status"
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("app.whatsapp.templates.send", {
                  template: liveTemplate.slug
                }),
                className: "w-full sm:w-auto",
                children: /* @__PURE__ */ jsxs(Button, { className: "w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50", children: [
                  /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
                  "Send Template"
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: handleArchive,
                disabled: actionState !== null,
                className: "w-full sm:w-auto text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20",
                children: actionState === "archive" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Archiving..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4 mr-2" }),
                  "Archive"
                ] })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "secondary",
                onClick: handleDelete,
                disabled: actionState !== null,
                className: "w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                children: actionState === "delete" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                  "Deleting..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
                  "Delete"
                ] })
              }
            )
          ] })
        ] })
      ] }),
      liveTemplate.rejection_reason && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Rejection Reason" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: liveTemplate.rejection_reason })
        ] })
      ] }),
      liveTemplate.last_meta_error && /* @__PURE__ */ jsxs(Alert, { variant: "error", className: "border-red-200 dark:border-red-800", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-red-800 dark:text-red-200 mb-1", children: "Meta Error" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: liveTemplate.last_meta_error })
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
          liveTemplate.header_type && liveTemplate.header_text && /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "px-2 py-1 text-xs", children: [
              "Header (",
              liveTemplate.header_type,
              ")"
            ] }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: liveTemplate.header_text })
          ] }),
          liveTemplate.body_text && /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "default", className: "px-2 py-1 text-xs", children: "Body" }),
              liveTemplate.variable_count > 0 && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "px-2 py-1 text-xs", children: [
                liveTemplate.variable_count,
                " variables"
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed", children: liveTemplate.body_text })
          ] }),
          liveTemplate.footer_text && /* @__PURE__ */ jsxs("div", { className: "p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsx(Badge, { variant: "default", className: "px-2 py-1 text-xs", children: "Footer" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-900 dark:text-gray-100", children: liveTemplate.footer_text })
          ] }),
          liveTemplate.has_buttons && liveTemplate.buttons.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsx(Badge, { variant: "default", className: "px-2 py-1 text-xs", children: "Buttons" }) }),
            /* @__PURE__ */ jsx("div", { className: "space-y-2", children: liveTemplate.buttons.map((button, index) => /* @__PURE__ */ jsxs(
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
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: liveTemplate.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Language" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: liveTemplate.language })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Category" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: liveTemplate.category })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Status" }),
            /* @__PURE__ */ jsx("dd", { children: getStatusBadge(liveTemplate.status) })
          ] }),
          liveTemplate.quality_score && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1", children: "Quality Score" }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: liveTemplate.quality_score })
          ] }),
          liveTemplate.last_synced_at && /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
            /* @__PURE__ */ jsxs("dt", { className: "text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3.5 w-3.5" }),
              "Last Synced"
            ] }),
            /* @__PURE__ */ jsx("dd", { className: "text-sm font-semibold text-gray-900 dark:text-gray-100", children: new Date(liveTemplate.last_synced_at).toLocaleString() })
          ] })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  TemplatesShow as default
};
