import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { BarChart3, Bug, FileText } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function AnalyticsTab({ data, setData, errors }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }),
        "Analytics Providers"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 dark:border-gray-700 pb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Google Analytics" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "analytics.google_analytics_id", value: "Tracking ID" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "analytics.google_analytics_id",
                  type: "text",
                  value: data.analytics?.google_analytics_id || "",
                  onChange: (e) => setData("analytics.google_analytics_id", e.target.value),
                  className: "mt-1",
                  placeholder: "G-XXXXXXXXXX"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors["analytics.google_analytics_id"] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Enable Google Analytics" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Track user behavior" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: data.analytics?.google_analytics_enabled || false,
                    onChange: (e) => setData("analytics.google_analytics_enabled", e.target.checked),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Mixpanel" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "analytics.mixpanel_token", value: "Project Token" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "analytics.mixpanel_token",
                  type: "text",
                  value: data.analytics?.mixpanel_token || "",
                  onChange: (e) => setData("analytics.mixpanel_token", e.target.value),
                  className: "mt-1",
                  placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors["analytics.mixpanel_token"] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(InputLabel, { value: "Enable Mixpanel" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Event tracking and analytics" })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: data.analytics?.mixpanel_enabled || false,
                    onChange: (e) => setData("analytics.mixpanel_enabled", e.target.checked),
                    className: "sr-only peer"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Bug, { className: "h-5 w-5" }),
        "Error Tracking"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4", children: "Sentry" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "analytics.sentry_dsn", value: "DSN" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "analytics.sentry_dsn",
                type: "text",
                value: data.analytics?.sentry_dsn || "",
                onChange: (e) => setData("analytics.sentry_dsn", e.target.value),
                className: "mt-1",
                placeholder: "https://xxx@xxx.ingest.sentry.io/xxx"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["analytics.sentry_dsn"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "analytics.sentry_environment", value: "Environment" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "analytics.sentry_environment",
                value: data.analytics?.sentry_environment || "production",
                onChange: (e) => setData("analytics.sentry_environment", e.target.value),
                className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "production", children: "Production" }),
                  /* @__PURE__ */ jsx("option", { value: "staging", children: "Staging" }),
                  /* @__PURE__ */ jsx("option", { value: "development", children: "Development" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["analytics.sentry_environment"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Enable Sentry" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Track and monitor errors" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.analytics?.sentry_enabled || false,
                  onChange: (e) => setData("analytics.sentry_enabled", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }),
        "Logging"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "analytics.log_level", value: "Log Level" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "analytics.log_level",
              value: data.analytics?.log_level || "info",
              onChange: (e) => setData("analytics.log_level", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "debug", children: "Debug" }),
                /* @__PURE__ */ jsx("option", { value: "info", children: "Info" }),
                /* @__PURE__ */ jsx("option", { value: "warning", children: "Warning" }),
                /* @__PURE__ */ jsx("option", { value: "error", children: "Error" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["analytics.log_level"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Log API Requests" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Log all API requests and responses" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.analytics?.log_api_requests || false,
                onChange: (e) => setData("analytics.log_api_requests", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  AnalyticsTab as default
};
