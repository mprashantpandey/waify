import { jsx, jsxs } from "react/jsx-runtime";
import { usePage, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { P as PlatformShell } from "./PlatformShell-DKXjXK7A.js";
import { C as Card, c as CardContent } from "./Card-8uw03vLH.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { u as useNotifications } from "./useNotifications-802S-ToN.js";
import { Search, Eye, Ban, CheckCircle } from "lucide-react";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "axios";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "laravel-echo";
import "pusher-js";
import "./useConfirm-94UId2r4.js";
function PlatformWorkspacesIndex({
  workspaces,
  filters
}) {
  const { auth } = usePage().props;
  const { confirm, toast } = useNotifications();
  const [localFilters, setLocalFilters] = useState(filters);
  const applyFilters = () => {
    router.get(route("platform.workspaces.index"), localFilters, {
      preserveState: true,
      preserveScroll: true
    });
  };
  const handleDisable = async (workspaceId, workspaceName) => {
    const confirmed = await confirm({
      title: "Disable Workspace",
      message: `Are you sure you want to disable "${workspaceName}"? Users will not be able to access it.`,
      variant: "danger",
      confirmText: "Disable",
      cancelText: "Cancel"
    });
    if (confirmed) {
      router.post(
        route("platform.workspaces.disable", { workspace: workspaceId }),
        { reason: "Disabled by platform admin" },
        {
          onSuccess: () => {
            toast.success("Workspace disabled successfully");
          },
          onError: () => {
            toast.error("Failed to disable workspace");
          }
        }
      );
    }
  };
  const handleEnable = async (workspaceId, workspaceName) => {
    const confirmed = await confirm({
      title: "Enable Workspace",
      message: `Are you sure you want to enable "${workspaceName}"?`,
      variant: "info",
      confirmText: "Enable",
      cancelText: "Cancel"
    });
    if (confirmed) {
      router.post(
        route("platform.workspaces.enable", { workspace: workspaceId }),
        {},
        {
          onSuccess: () => {
            toast.success("Workspace enabled successfully");
          },
          onError: () => {
            toast.error("Failed to enable workspace");
          }
        }
      );
    }
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
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-gray-100", children: "Workspaces" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: "Manage all workspaces on the platform" })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Search" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "text",
              value: localFilters.search,
              onChange: (e) => setLocalFilters({ ...localFilters, search: e.target.value }),
              onKeyDown: (e) => e.key === "Enter" && applyFilters(),
              className: "pl-10",
              placeholder: "Search workspaces..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Status" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: localFilters.status,
            onChange: (e) => setLocalFilters({ ...localFilters, status: e.target.value }),
            className: "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "All Statuses" }),
              /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
              /* @__PURE__ */ jsx("option", { value: "suspended", children: "Suspended" }),
              /* @__PURE__ */ jsx("option", { value: "disabled", children: "Disabled" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsx(Button, { onClick: applyFilters, className: "w-full", children: "Apply Filters" }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Workspace" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Owner" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Created" }),
        /* @__PURE__ */ jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { className: "bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800", children: workspaces.data.map((workspace) => /* @__PURE__ */ jsxs(
        "tr",
        {
          className: "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
          children: [
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: workspace.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: workspace.slug })
            ] }) }),
            /* @__PURE__ */ jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-gray-900 dark:text-gray-100", children: workspace.owner.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: workspace.owner.email })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: getStatusBadge(workspace.status) }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400", children: new Date(workspace.created_at).toLocaleDateString() }),
            /* @__PURE__ */ jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
              /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("platform.workspaces.show", {
                    workspace: workspace.id
                  }),
                  children: /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", children: [
                    /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-1" }),
                    "View"
                  ] })
                }
              ),
              workspace.status === "active" ? /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "danger",
                  size: "sm",
                  onClick: () => handleDisable(workspace.id, workspace.name),
                  children: [
                    /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4 mr-1" }),
                    "Disable"
                  ]
                }
              ) : /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "success",
                  size: "sm",
                  onClick: () => handleEnable(workspace.id, workspace.name),
                  children: [
                    /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 mr-1" }),
                    "Enable"
                  ]
                }
              )
            ] }) })
          ]
        },
        workspace.id
      )) })
    ] }) }) }) }),
    workspaces.links && workspaces.links.length > 3 && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-2", children: workspaces.links.map((link, index) => /* @__PURE__ */ jsx(
      Link,
      {
        href: link.url || "#",
        className: `px-3 py-2 rounded-lg text-sm ${link.active ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"} ${!link.url && "opacity-50 cursor-not-allowed"}`,
        dangerouslySetInnerHTML: { __html: link.label }
      },
      index
    )) })
  ] }) });
}
export {
  PlatformWorkspacesIndex as default
};
