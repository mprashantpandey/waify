import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { ArrowLeft, Ban, CheckCircle, Users, Zap, Building2, MessageSquare } from "lucide-react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "axios";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
function PlatformWorkspacesShow({
  workspace
}) {
  const { auth } = usePage().props;
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmEnable, setConfirmEnable] = useState(false);
  const handleDisable = () => {
    router.post(route("platform.workspaces.disable", { workspace: workspace.id }), {
      reason: "Disabled by platform admin"
    });
    setConfirmDisable(false);
  };
  const handleEnable = () => {
    router.post(route("platform.workspaces.enable", { workspace: workspace.id }));
    setConfirmEnable(false);
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { variant: "success", label: "Active" },
      suspended: { variant: "warning", label: "Suspended" },
      disabled: { variant: "danger", label: "Disabled" }
    };
    const config = statusMap[status] || { variant: "default", label: status };
    return /* @__PURE__ */ jsx(Badge, { variant: config.variant, children: config.label });
  };
  return /* @__PURE__ */ jsx(PlatformShell, { auth, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: route("platform.workspaces.index"),
        className: "inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
          "Back to Workspaces"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3", children: [
          workspace.name,
          getStatusBadge(workspace.status)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: workspace.slug })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: workspace.status === "active" ? /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "danger",
          onClick: () => setConfirmDisable(true),
          children: [
            /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4 mr-2" }),
            "Disable Workspace"
          ]
        }
      ) : /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "success",
          onClick: () => setConfirmEnable(true),
          children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 mr-2" }),
            "Enable Workspace"
          ]
        }
      ) })
    ] }),
    workspace.disabled_reason && /* @__PURE__ */ jsx(Card, { className: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-red-800 dark:text-red-200", children: [
        /* @__PURE__ */ jsx("strong", { children: "Disabled Reason:" }),
        " ",
        workspace.disabled_reason
      ] }),
      workspace.disabled_at && /* @__PURE__ */ jsxs("p", { className: "text-xs text-red-600 dark:text-red-400 mt-1", children: [
        "Disabled at: ",
        new Date(workspace.disabled_at).toLocaleString()
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Workspace Information" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: workspace.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Slug" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: workspace.slug })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Status" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1", children: getStatusBadge(workspace.status) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Created" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: new Date(workspace.created_at).toLocaleString() })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Owner" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("dl", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Name" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: workspace.owner.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-sm font-medium text-gray-500 dark:text-gray-400", children: "Email" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-sm text-gray-900 dark:text-gray-100", children: workspace.owner.email })
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Statistics" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: workspace.members_count }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Members" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: workspace.modules_enabled }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Modules Enabled" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: workspace.whatsapp_connections_count }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "WhatsApp Connections" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: workspace.conversations_count }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400", children: "Conversations" })
        ] })
      ] }) })
    ] }),
    confirmDisable && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Disable Workspace" }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Are you sure you want to disable this workspace? Users will not be able to access it." }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "danger", onClick: handleDisable, children: "Disable" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setConfirmDisable(false), children: "Cancel" })
        ] })
      ] })
    ] }) }),
    confirmEnable && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Enable Workspace" }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Are you sure you want to enable this workspace?" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "success", onClick: handleEnable, children: "Enable" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setConfirmEnable(false), children: "Cancel" })
        ] })
      ] })
    ] }) })
  ] }) });
}
export {
  PlatformWorkspacesShow as default
};
