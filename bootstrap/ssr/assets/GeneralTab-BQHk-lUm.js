import { jsxs, jsx } from "react/jsx-runtime";
import { Link2, Globe, Wrench } from "lucide-react";
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
function GeneralTab({ data, setData, errors }) {
  const general = data.general || {};
  const updateField = (field, value) => setData(`general.${field}`, value);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Link2, { className: "h-5 w-5" }),
          "Platform URL"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Used for callbacks, invoices, hosted widgets, webhook examples, and public links." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "general.platform_url", children: "Canonical URL" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "general.platform_url",
            type: "url",
            value: general.platform_url || "",
            onChange: (event) => updateField("platform_url", event.target.value),
            placeholder: "https://app.zyptos.com"
          }
        ),
        /* @__PURE__ */ jsx(FieldError, { message: errors["general.platform_url"] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }),
          "Localization"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Default formatting for admin views, billing documents, and workspace fallbacks." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "general.timezone", children: "Default Timezone" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.timezone",
              value: general.timezone || "Asia/Kolkata",
              onChange: (event) => updateField("timezone", event.target.value),
              className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "Asia/Kolkata", children: "Asia/Kolkata (IST)" }),
                /* @__PURE__ */ jsx("option", { value: "UTC", children: "UTC" }),
                /* @__PURE__ */ jsx("option", { value: "Asia/Dubai", children: "Asia/Dubai (GST)" }),
                /* @__PURE__ */ jsx("option", { value: "Europe/London", children: "Europe/London (GMT)" }),
                /* @__PURE__ */ jsx("option", { value: "Europe/Paris", children: "Europe/Paris (CET)" }),
                /* @__PURE__ */ jsx("option", { value: "America/New_York", children: "America/New_York (ET)" }),
                /* @__PURE__ */ jsx("option", { value: "America/Los_Angeles", children: "America/Los_Angeles (PT)" }),
                /* @__PURE__ */ jsx("option", { value: "Asia/Singapore", children: "Asia/Singapore (SGT)" }),
                /* @__PURE__ */ jsx("option", { value: "Australia/Sydney", children: "Australia/Sydney (AEDT)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["general.timezone"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "general.locale", children: "Default Locale" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.locale",
              value: general.locale || "en",
              onChange: (event) => updateField("locale", event.target.value),
              className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "en", children: "English" }),
                /* @__PURE__ */ jsx("option", { value: "hi", children: "Hindi" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["general.locale"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "general.date_format", children: "Date Format" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.date_format",
              value: general.date_format || "d/m/Y",
              onChange: (event) => updateField("date_format", event.target.value),
              className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "d/m/Y", children: "DD/MM/YYYY (17/05/2026)" }),
                /* @__PURE__ */ jsx("option", { value: "Y-m-d", children: "YYYY-MM-DD (2026-05-17)" }),
                /* @__PURE__ */ jsx("option", { value: "m/d/Y", children: "MM/DD/YYYY (05/17/2026)" }),
                /* @__PURE__ */ jsx("option", { value: "d M Y", children: "DD MMM YYYY (17 May 2026)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["general.date_format"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "general.time_format", children: "Time Format" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.time_format",
              value: general.time_format || "12",
              onChange: (event) => updateField("time_format", event.target.value),
              className: "mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text",
              children: [
                /* @__PURE__ */ jsx("option", { value: "12", children: "12-hour (2:30 PM)" }),
                /* @__PURE__ */ jsx("option", { value: "24", children: "24-hour (14:30)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["general.time_format"] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Wrench, { className: "h-5 w-5" }),
          "Maintenance"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Temporarily restrict platform access while keeping super admin recovery available." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Maintenance Mode" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Only super admins can access the platform when enabled." })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: general.maintenance_mode || false, onCheckedChange: (checked) => updateField("maintenance_mode", checked) })
        ] }),
        general.maintenance_mode && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "general.maintenance_message", children: "Maintenance Message" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "general.maintenance_message",
              value: general.maintenance_message || "",
              onChange: (event) => updateField("maintenance_message", event.target.value),
              placeholder: "We're performing scheduled maintenance. We'll be back shortly."
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["general.maintenance_message"] })
        ] })
      ] })
    ] })
  ] });
}
export {
  GeneralTab as default
};
