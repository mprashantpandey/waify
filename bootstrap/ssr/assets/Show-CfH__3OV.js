import { jsxs, jsx } from "react/jsx-runtime";
import { usePage, Head, Link } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-COfIDu4w.js";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { ArrowLeft, Building2, AlertCircle, XCircle, Clock, CheckCircle } from "lucide-react";
import "react";
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
function TemplatesShow({ template }) {
  const { auth } = usePage().props;
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
    /* @__PURE__ */ jsx(Head, { title: `Template: ${template.name}` }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Link, { href: route("platform.templates.index"), children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Templates"
        ] }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: template.name }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Template details and metadata" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Template Content" }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              template.header_text && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Header" }),
                /* @__PURE__ */ jsx("p", { className: "text-base text-gray-900 dark:text-gray-100", children: template.header_text })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Body" }),
                /* @__PURE__ */ jsx("p", { className: "text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap", children: template.body_text })
              ] }),
              template.footer_text && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-1", children: "Footer" }),
                /* @__PURE__ */ jsx("p", { className: "text-base text-gray-900 dark:text-gray-100", children: template.footer_text })
              ] }),
              template.buttons && template.buttons.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400 mb-2", children: "Buttons" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-2", children: template.buttons.map((button, index) => /* @__PURE__ */ jsxs("div", { className: "p-3 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: button.text || button.title }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                    "Type: ",
                    button.type
                  ] })
                ] }, index)) })
              ] })
            ] })
          ] }),
          template.components && template.components.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Components" }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("pre", { className: "text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-auto", children: JSON.stringify(template.components, null, 2) }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Template Information" }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Status" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1", children: getStatusBadge(template.status) })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Category" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mt-1", children: template.category })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Language" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mt-1", children: template.language })
              ] }),
              template.quality_score && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Quality Score" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mt-1", children: template.quality_score })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Created" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mt-1", children: new Date(template.created_at).toLocaleString() })
              ] }),
              template.last_synced_at && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Last Synced" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100 mt-1", children: new Date(template.last_synced_at).toLocaleString() })
              ] }),
              template.is_archived && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Archived" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Tenant" }) }),
            /* @__PURE__ */ jsxs(CardContent, { children: [
              /* @__PURE__ */ jsxs(
                Link,
                {
                  href: route("platform.accounts.show", { account: template.account.id }),
                  className: "flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline",
                  children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
                    template.account.name
                  ]
                }
              ),
              template.connection && /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Connection" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: template.connection.name })
              ] })
            ] })
          ] }),
          template.last_meta_error && /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-red-600 dark:text-red-400", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
              "Last Error"
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 dark:text-red-400", children: template.last_meta_error }) })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  TemplatesShow as default
};
