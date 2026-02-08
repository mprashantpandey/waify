import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, Head, router } from "@inertiajs/react";
import { P as PlatformShell } from "./PlatformShell-COfIDu4w.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { u as useConfirm } from "./useConfirm-BKf7Nv1N.js";
import { Crown, Puzzle, ToggleRight, ToggleLeft } from "lucide-react";
import "react";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "axios";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function PlatformModulesIndex({ modules }) {
  const { addToast } = useToast();
  const confirm = useConfirm();
  const { flash } = usePage().props;
  const handleToggle = async (module) => {
    if (module.is_core) {
      addToast({
        title: "Cannot Disable",
        description: "Core modules cannot be disabled at the platform level.",
        variant: "error"
      });
      return;
    }
    const action = module.is_enabled ? "disable" : "enable";
    const confirmed = await confirm({
      title: `${action === "enable" ? "Enable" : "Disable"} Module`,
      message: `Are you sure you want to ${action} ${module.name} at the platform level? This will affect all tenants.`,
      variant: action === "enable" ? "info" : "warning"
    });
    if (!confirmed) return;
    router.post(
      route("platform.modules.toggle", { module: module.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          addToast({
            title: "Module Updated",
            description: `${module.name} has been ${action}d at the platform level.`,
            variant: "success"
          });
          router.reload({ only: ["modules"] });
        },
        onError: (errors) => {
          addToast({
            title: "Error",
            description: errors?.message || "Failed to update module status.",
            variant: "error"
          });
        }
      }
    );
  };
  const coreModules = modules.filter((m) => m.is_core);
  const addonModules = modules.filter((m) => !m.is_core);
  return /* @__PURE__ */ jsxs(PlatformShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Module Management" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: "Module Management" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: "Enable or disable modules systemwide. Disabled modules will not be available to any tenant." })
      ] }),
      flash?.success && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-green-50 dark:bg-green-900/20 p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-green-800 dark:text-green-200", children: flash.success }) }),
      flash?.error && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-red-50 dark:bg-red-900/20 p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: flash.error }) }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Crown, { className: "h-5 w-5 text-yellow-500" }),
            "Core Modules"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Essential modules that cannot be disabled" })
        ] }) }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: coreModules.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No core modules found." }) : coreModules.map((module) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Puzzle, { className: "h-5 w-5 text-gray-400" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900 dark:text-white", children: module.name }),
                  module.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: module.description }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                    /* @__PURE__ */ jsx(Badge, { variant: module.is_enabled ? "success" : "default", children: module.is_enabled ? "Enabled" : "Disabled" }),
                    /* @__PURE__ */ jsx(Badge, { variant: "info", children: "Core" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      module.account_count,
                      " tenant",
                      module.account_count !== 1 ? "s" : "",
                      " using"
                    ] })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(Badge, { variant: "warning", children: "Cannot Disable" }) })
            ]
          },
          module.id
        )) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Puzzle, { className: "h-5 w-5 text-blue-500" }),
            "Addon Modules"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Optional modules that can be enabled or disabled" })
        ] }) }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: addonModules.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "No addon modules found." }) : addonModules.map((module) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(Puzzle, { className: "h-5 w-5 text-gray-400" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-medium text-gray-900 dark:text-white", children: module.name }),
                  module.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: module.description }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                    /* @__PURE__ */ jsx(Badge, { variant: module.is_enabled ? "success" : "default", children: module.is_enabled ? "Enabled" : "Disabled" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                      module.account_count,
                      " tenant",
                      module.account_count !== 1 ? "s" : "",
                      " using"
                    ] })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: module.is_enabled ? "danger" : "primary",
                  size: "sm",
                  onClick: () => handleToggle(module),
                  children: module.is_enabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ToggleRight, { className: "h-4 w-4 mr-1" }),
                    "Disable"
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(ToggleLeft, { className: "h-4 w-4 mr-1" }),
                    "Enable"
                  ] })
                }
              ) })
            ]
          },
          module.id
        )) }) })
      ] })
    ] })
  ] });
}
export {
  PlatformModulesIndex as default
};
