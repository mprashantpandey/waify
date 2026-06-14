import { jsxs, jsx } from "react/jsx-runtime";
import { BarChart3, MousePointerClick, FileText } from "lucide-react";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Switch } from "./Switch-D6_sQewh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function FieldError({ message }) {
  if (!message) return null;
  return /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-300", children: message });
}
function ToggleRow({
  label,
  description,
  checked,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: label }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: description })
    ] }),
    /* @__PURE__ */ jsx(Switch, { checked, onCheckedChange: onChange })
  ] });
}
function AnalyticsTab({ data, setData, errors }) {
  const analytics = data.analytics || {};
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }),
          "Product Analytics"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Connect visitor and product analytics used by public pages and app events." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4 xl:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(MousePointerClick, { className: "h-4 w-4 text-waify-green dark:text-emerald-300" }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Google Analytics" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "analytics.google_analytics_id", children: "Measurement ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "analytics.google_analytics_id",
                value: analytics.google_analytics_id || "",
                onChange: (event) => setData("analytics.google_analytics_id", event.target.value),
                placeholder: "G-XXXXXXXXXX"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["analytics.google_analytics_id"] })
          ] }),
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              label: "Enable tracking",
              description: "Inject Google Analytics on public pages when a measurement ID is present.",
              checked: analytics.google_analytics_enabled || false,
              onChange: (checked) => setData("analytics.google_analytics_enabled", checked)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-waify-green dark:text-emerald-300" }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Mixpanel" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "analytics.mixpanel_token", children: "Project Token" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "analytics.mixpanel_token",
                value: analytics.mixpanel_token || "",
                onChange: (event) => setData("analytics.mixpanel_token", event.target.value),
                placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["analytics.mixpanel_token"] })
          ] }),
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              label: "Enable product events",
              description: "Use Mixpanel for app events and funnel analytics when a token is configured.",
              checked: analytics.mixpanel_enabled || false,
              onChange: (checked) => setData("analytics.mixpanel_enabled", checked)
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }),
          "Application Logging"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Control local application logs without exposing unused third-party error tracking settings." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "analytics.log_level", children: "Log Level" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "analytics.log_level",
              value: analytics.log_level || "info",
              onChange: (event) => setData("analytics.log_level", event.target.value),
              className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "debug", children: "Debug" }),
                /* @__PURE__ */ jsx("option", { value: "info", children: "Info" }),
                /* @__PURE__ */ jsx("option", { value: "warning", children: "Warning" }),
                /* @__PURE__ */ jsx("option", { value: "error", children: "Error" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["analytics.log_level"] })
        ] }),
        /* @__PURE__ */ jsx(
          ToggleRow,
          {
            label: "Log API requests",
            description: "Record API request metadata for troubleshooting. Avoid enabling this permanently on high traffic installs.",
            checked: analytics.log_api_requests || false,
            onChange: (checked) => setData("analytics.log_api_requests", checked)
          }
        )
      ] })
    ] })
  ] });
}
export {
  AnalyticsTab as default
};
