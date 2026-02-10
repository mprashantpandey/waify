import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AppShell } from "./AppShell-B4peoZD-.js";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./Card-DLPTnTfC.js";
import { B as Badge } from "./Badge-CHx1ViYT.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { Puzzle, Crown, Zap, CheckCircle2, XCircle, ToggleRight, ToggleLeft } from "lucide-react";
import { usePage, Head, router } from "@inertiajs/react";
import { u as useToast } from "./useToast-DNfJQ6ZA.js";
import { u as useConfirm } from "./useConfirm-BKf7Nv1N.js";
import "react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "./RealtimeProvider-Dletx5Ny.js";
import "laravel-echo";
import "pusher-js";
import "./GlobalFlashHandler-CNoF0uzm.js";
import "./BrandingWrapper-B2Mh0bYb.js";
import "./Alert-DWa0cnrh.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function Modules({ modules, account, current_plan }) {
  const { addToast } = useToast();
  const confirm = useConfirm();
  const page = usePage();
  const { flash } = page.props;
  const handleToggleModule = async (module) => {
    if (!module.can_toggle) {
      addToast({
        title: "Cannot toggle module",
        description: "This module is not available on your current plan.",
        variant: "error"
      });
      return;
    }
    const action = module.enabled ? "disable" : "enable";
    const confirmed = await confirm({
      title: `${action === "enable" ? "Enable" : "Disable"} Module`,
      message: `Are you sure you want to ${action} ${module.name}?`,
      variant: action === "enable" ? "info" : "warning"
    });
    if (!confirmed) return;
    if (!module?.key) {
      console.error("Module key missing:", module);
      addToast({
        title: "Error",
        description: "Module information is missing.",
        variant: "error"
      });
      return;
    }
    const directUrl = route("app.modules.toggle", { moduleKey: module.key });
    console.log("Toggling module:", { moduleKey: module.key, url: directUrl });
    router.post(
      directUrl,
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          addToast({
            title: "Module updated",
            description: `${module.name} has been ${module.enabled ? "disabled" : "enabled"}.`,
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
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Modules" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent", children: "Modules" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-gray-600 dark:text-gray-400", children: current_plan ? /* @__PURE__ */ jsxs(Fragment, { children: [
          "Manage modules available on your ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: current_plan.name }),
          " plan"
        ] }) : "Manage your modules and features" })
      ] }) }) }),
      modules.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-0 shadow-lg", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Puzzle, { className: "h-12 w-12 mx-auto text-gray-400 mb-4" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2", children: "No Modules Available" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "No modules are available on your current plan. Please upgrade to access more features." })
      ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3", children: modules.map((module) => /* @__PURE__ */ jsxs(Card, { className: `border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden ${module.enabled ? "ring-2 ring-green-500/20" : ""}`, children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 pb-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1", children: [
          /* @__PURE__ */ jsx("div", { className: `p-3 rounded-xl ${module.enabled ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-gray-400 to-gray-500"} group-hover:scale-110 transition-transform duration-200`, children: /* @__PURE__ */ jsx(Puzzle, { className: "h-5 w-5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(CardTitle, { className: "text-lg font-bold text-gray-900 dark:text-gray-100", children: module.name }),
              module.is_in_plan && !module.is_core && /* @__PURE__ */ jsx("span", { title: "Included in your plan", children: /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-yellow-500" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
              module.is_core && /* @__PURE__ */ jsxs(Badge, { variant: "info", className: "text-xs", children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 mr-1" }),
                "Core"
              ] }),
              module.is_in_plan && !module.is_core && /* @__PURE__ */ jsxs(Badge, { variant: "success", className: "text-xs", children: [
                /* @__PURE__ */ jsx(Crown, { className: "h-3 w-3 mr-1" }),
                "In Plan"
              ] })
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 leading-relaxed", children: module.description || "No description available" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700", children: [
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
              Badge,
              {
                variant: module.enabled ? "success" : "default",
                className: "flex items-center gap-1.5 px-3 py-1",
                children: module.enabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5" }),
                  "Enabled"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5" }),
                  "Disabled"
                ] })
              }
            ) }),
            module.can_toggle && /* @__PURE__ */ jsx(
              Button,
              {
                variant: module.enabled ? "secondary" : "primary",
                size: "sm",
                onClick: () => handleToggleModule(module),
                className: "flex items-center gap-2",
                children: module.enabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ToggleRight, { className: "h-4 w-4" }),
                  "Disable"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(ToggleLeft, { className: "h-4 w-4" }),
                  "Enable"
                ] })
              }
            )
          ] })
        ] })
      ] }, module.id)) })
    ] })
  ] });
}
export {
  Modules as default
};
