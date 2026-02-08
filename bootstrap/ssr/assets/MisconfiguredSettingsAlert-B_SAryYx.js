import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
import { AlertCircle, AlertTriangle, XCircle, Settings, X } from "lucide-react";
import { A as Alert } from "./Alert-DWa0cnrh.js";
import { C as Card, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
function MisconfiguredSettingsAlert({
  misconfiguredSettings,
  onDismiss,
  variant = "dashboard"
}) {
  if (!misconfiguredSettings || misconfiguredSettings.length === 0) {
    return null;
  }
  const criticalIssues = misconfiguredSettings.filter((s) => s.required);
  const nonCriticalIssues = misconfiguredSettings.filter((s) => !s.required);
  if (variant === "settings") {
    return /* @__PURE__ */ jsxs("div", { className: "mb-6 space-y-3", children: [
      criticalIssues.length > 0 && /* @__PURE__ */ jsxs(Alert, { variant: "error", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-sm mb-1", children: [
            criticalIssues.length,
            " Critical Configuration Issue",
            criticalIssues.length > 1 ? "s" : "",
            " Found"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "text-sm space-y-1 list-disc list-inside", children: criticalIssues.map((setting, index) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              setting.name,
              ":"
            ] }),
            " ",
            setting.issues.join(", ")
          ] }, index)) })
        ] })
      ] }),
      nonCriticalIssues.length > 0 && /* @__PURE__ */ jsxs(Alert, { variant: "warning", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-sm mb-1", children: [
            nonCriticalIssues.length,
            " Optional Configuration Issue",
            nonCriticalIssues.length > 1 ? "s" : "",
            " Found"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "text-sm space-y-1 list-disc list-inside", children: nonCriticalIssues.map((setting, index) => /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              setting.name,
              ":"
            ] }),
            " ",
            setting.issues.join(", ")
          ] }, index)) })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsx(Card, { className: "border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 mb-6", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 bg-amber-500 rounded-lg", children: /* @__PURE__ */ jsx(AlertCircle, { className: "h-6 w-6 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-bold text-gray-900 dark:text-gray-100 mb-2", children: "Platform Configuration Issues Detected" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4", children: "Some required settings are not properly configured. This may affect platform functionality." }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            criticalIssues.map((setting, index) => /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx(XCircle, { className: "h-4 w-4 text-red-500" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-gray-900 dark:text-gray-100", children: setting.name }),
                  /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded", children: "Critical" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mb-2", children: setting.impact }),
                /* @__PURE__ */ jsx("ul", { className: "text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside", children: setting.issues.map((issue, issueIndex) => /* @__PURE__ */ jsx("li", { children: issue }, issueIndex)) })
              ] }),
              /* @__PURE__ */ jsx(Link, { href: route("platform.settings") + `?tab=${setting.tab}`, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "primary", children: [
                /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5 mr-1" }),
                "Configure"
              ] }) })
            ] }) }, index)),
            nonCriticalIssues.map((setting, index) => /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-800 rounded-lg p-4 border border-amber-200 dark:border-amber-800", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-amber-500" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-gray-900 dark:text-gray-100", children: setting.name }),
                  /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded", children: "Optional" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-600 dark:text-gray-400 mb-2", children: setting.impact }),
                /* @__PURE__ */ jsx("ul", { className: "text-xs text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside", children: setting.issues.map((issue, issueIndex) => /* @__PURE__ */ jsx("li", { children: issue }, issueIndex)) })
              ] }),
              /* @__PURE__ */ jsx(Link, { href: route("platform.settings") + `?tab=${setting.tab}`, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", children: [
                /* @__PURE__ */ jsx(Settings, { className: "h-3.5 w-3.5 mr-1" }),
                "Configure"
              ] }) })
            ] }) }, index))
          ] })
        ] })
      ] }),
      onDismiss && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onDismiss,
          className: "p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors text-gray-500 dark:text-gray-400",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5", "aria-hidden": true })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t border-amber-200 dark:border-amber-800", children: /* @__PURE__ */ jsx(Link, { href: route("platform.settings"), children: /* @__PURE__ */ jsxs(Button, { variant: "primary", className: "w-full sm:w-auto", children: [
      /* @__PURE__ */ jsx(Settings, { className: "h-4 w-4 mr-2" }),
      "Go to Settings"
    ] }) }) })
  ] }) });
}
export {
  MisconfiguredSettingsAlert as M
};
