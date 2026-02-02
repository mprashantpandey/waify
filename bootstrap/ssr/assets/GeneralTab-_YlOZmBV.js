import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Globe, Wrench } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function GeneralTab({ data, setData, errors }) {
  const updateField = (field, value) => {
    setData(`general.${field}`, value);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Globe, { className: "h-5 w-5" }),
        "Localization"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "general.timezone", value: "Default Timezone" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.timezone",
              value: data.general?.timezone || "UTC",
              onChange: (e) => updateField("timezone", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "UTC", children: "UTC" }),
                /* @__PURE__ */ jsx("option", { value: "America/New_York", children: "America/New_York (EST)" }),
                /* @__PURE__ */ jsx("option", { value: "America/Chicago", children: "America/Chicago (CST)" }),
                /* @__PURE__ */ jsx("option", { value: "America/Denver", children: "America/Denver (MST)" }),
                /* @__PURE__ */ jsx("option", { value: "America/Los_Angeles", children: "America/Los_Angeles (PST)" }),
                /* @__PURE__ */ jsx("option", { value: "Europe/London", children: "Europe/London (GMT)" }),
                /* @__PURE__ */ jsx("option", { value: "Europe/Paris", children: "Europe/Paris (CET)" }),
                /* @__PURE__ */ jsx("option", { value: "Asia/Dubai", children: "Asia/Dubai (GST)" }),
                /* @__PURE__ */ jsx("option", { value: "Asia/Kolkata", children: "Asia/Kolkata (IST)" }),
                /* @__PURE__ */ jsx("option", { value: "Asia/Tokyo", children: "Asia/Tokyo (JST)" }),
                /* @__PURE__ */ jsx("option", { value: "Australia/Sydney", children: "Australia/Sydney (AEDT)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["general.timezone"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "general.locale", value: "Default Locale" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.locale",
              value: data.general?.locale || "en",
              onChange: (e) => updateField("locale", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "en", children: "English" }),
                /* @__PURE__ */ jsx("option", { value: "es", children: "Spanish" }),
                /* @__PURE__ */ jsx("option", { value: "fr", children: "French" }),
                /* @__PURE__ */ jsx("option", { value: "de", children: "German" }),
                /* @__PURE__ */ jsx("option", { value: "it", children: "Italian" }),
                /* @__PURE__ */ jsx("option", { value: "pt", children: "Portuguese" }),
                /* @__PURE__ */ jsx("option", { value: "zh", children: "Chinese" }),
                /* @__PURE__ */ jsx("option", { value: "ja", children: "Japanese" }),
                /* @__PURE__ */ jsx("option", { value: "ko", children: "Korean" }),
                /* @__PURE__ */ jsx("option", { value: "ar", children: "Arabic" }),
                /* @__PURE__ */ jsx("option", { value: "hi", children: "Hindi" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["general.locale"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "general.date_format", value: "Date Format" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.date_format",
              value: data.general?.date_format || "Y-m-d",
              onChange: (e) => updateField("date_format", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "Y-m-d", children: "YYYY-MM-DD (2024-01-15)" }),
                /* @__PURE__ */ jsx("option", { value: "m/d/Y", children: "MM/DD/YYYY (01/15/2024)" }),
                /* @__PURE__ */ jsx("option", { value: "d/m/Y", children: "DD/MM/YYYY (15/01/2024)" }),
                /* @__PURE__ */ jsx("option", { value: "M d, Y", children: "MMM DD, YYYY (Jan 15, 2024)" }),
                /* @__PURE__ */ jsx("option", { value: "d M Y", children: "DD MMM YYYY (15 Jan 2024)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["general.date_format"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "general.time_format", value: "Time Format" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "general.time_format",
              value: data.general?.time_format || "24",
              onChange: (e) => updateField("time_format", e.target.value),
              className: "mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500",
              children: [
                /* @__PURE__ */ jsx("option", { value: "24", children: "24-hour (14:30)" }),
                /* @__PURE__ */ jsx("option", { value: "12", children: "12-hour (2:30 PM)" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["general.time_format"] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Wrench, { className: "h-5 w-5" }),
        "System Status"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Maintenance Mode" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "When enabled, only super admins can access the platform" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.general?.maintenance_mode || false,
                onChange: (e) => updateField("maintenance_mode", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] }),
        data.general?.maintenance_mode && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "general.maintenance_message", value: "Maintenance Message" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "general.maintenance_message",
              type: "text",
              value: data.general?.maintenance_message || "",
              onChange: (e) => updateField("maintenance_message", e.target.value),
              className: "mt-1",
              placeholder: "We're performing scheduled maintenance. We'll be back shortly."
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["general.maintenance_message"] })
        ] })
      ] })
    ] })
  ] });
}
export {
  GeneralTab as default
};
