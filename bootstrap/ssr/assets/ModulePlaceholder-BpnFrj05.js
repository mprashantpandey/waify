import { jsxs, jsx } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-tmVeunvc.js";
import { B as Badge } from "./RealtimeProvider-DfTOxbgl.js";
import { Sparkles } from "lucide-react";
import { Head } from "@inertiajs/react";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./GlobalFlashHandler-DdgICiVx.js";
import "./useToast-DNfJQ6ZA.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Button-BocaoVWt.js";
import "axios";
import "laravel-echo";
import "pusher-js";
function ModulePlaceholder({ module }) {
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: module.name }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3 mb-2", children: [
          module.name,
          /* @__PURE__ */ jsx(Badge, { variant: module.enabled ? "success" : "default", className: "px-3 py-1", children: module.enabled ? "Enabled" : "Disabled" })
        ] }),
        module.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: module.description })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 mb-6", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-12 w-12 text-blue-600 dark:text-blue-400" }) }),
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2", children: [
          module.name,
          " - Coming Soon"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-500 dark:text-gray-400 max-w-md mx-auto", children: "This module is currently in development and will be available in a future phase." })
      ] })
    ] })
  ] });
}
export {
  ModulePlaceholder as default
};
