import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle, d as CardDescription } from "./Card-8uw03vLH.js";
import { B as Button } from "./Button-BocaoVWt.js";
import { Building2, Users, ArrowRight, Package } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function WorkspaceTab({ workspace }) {
  if (!workspace) {
    return /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4", children: /* @__PURE__ */ jsx(Building2, { className: "h-8 w-8 text-gray-400" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 font-medium", children: "No workspace selected" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-blue-500 rounded-xl", children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Workspace Information" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "View your workspace details" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Workspace Name" }),
          /* @__PURE__ */ jsx("p", { className: "text-base font-semibold text-gray-900 dark:text-gray-100", children: workspace.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2", children: "Workspace Slug" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-gray-900 dark:text-gray-100", children: workspace.slug })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Team Members" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Manage workspace members and their roles" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Invite team members, assign roles, and manage permissions for your workspace." }),
        /* @__PURE__ */ jsx(Link, { href: route("app.team.index", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-2" }),
          "Manage Members",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-0 shadow-lg", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl", children: /* @__PURE__ */ jsx(Package, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-xl font-bold", children: "Modules" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Enable or disable modules for this workspace" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Control which features and modules are available in your workspace." }),
        /* @__PURE__ */ jsx(Link, { href: route("app.modules", { workspace: workspace.slug }), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", className: "rounded-xl group", children: [
          /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 mr-2" }),
          "Manage Modules",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  WorkspaceTab as default
};
