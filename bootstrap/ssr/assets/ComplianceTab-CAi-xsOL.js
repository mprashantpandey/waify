import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { FileText, Shield, Database } from "lucide-react";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "react";
function ComplianceTab({ data, setData, errors }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5" }),
        "Legal Documents"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "compliance.terms_url", value: "Terms of Service URL" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "compliance.terms_url",
              type: "url",
              value: data.compliance?.terms_url || "",
              onChange: (e) => setData("compliance.terms_url", e.target.value),
              className: "mt-1",
              placeholder: "https://example.com/terms"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["compliance.terms_url"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "compliance.privacy_url", value: "Privacy Policy URL" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "compliance.privacy_url",
              type: "url",
              value: data.compliance?.privacy_url || "",
              onChange: (e) => setData("compliance.privacy_url", e.target.value),
              className: "mt-1",
              placeholder: "https://example.com/privacy"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["compliance.privacy_url"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "compliance.cookie_policy_url", value: "Cookie Policy URL" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "compliance.cookie_policy_url",
              type: "url",
              value: data.compliance?.cookie_policy_url || "",
              onChange: (e) => setData("compliance.cookie_policy_url", e.target.value),
              className: "mt-1",
              placeholder: "https://example.com/cookies"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["compliance.cookie_policy_url"] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }),
        "GDPR & Data Protection"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "GDPR Compliance Mode" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "Enable GDPR-compliant data handling" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.compliance?.gdpr_enabled || false,
                onChange: (e) => setData("compliance.gdpr_enabled", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "compliance.data_retention_days", value: "Data Retention (Days)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "compliance.data_retention_days",
                type: "number",
                value: data.compliance?.data_retention_days || 365,
                onChange: (e) => setData("compliance.data_retention_days", parseInt(e.target.value) || 365),
                className: "mt-1",
                min: "30",
                max: "2555"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Automatically delete data after this period" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["compliance.data_retention_days"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "compliance.data_officer_email", value: "Data Protection Officer Email" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "compliance.data_officer_email",
                type: "email",
                value: data.compliance?.data_officer_email || "",
                onChange: (e) => setData("compliance.data_officer_email", e.target.value),
                className: "mt-1",
                placeholder: "dpo@example.com"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["compliance.data_officer_email"] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Require Cookie Consent" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Show cookie consent banner" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.compliance?.cookie_consent_required || false,
                onChange: (e) => setData("compliance.cookie_consent_required", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
        "Data Management"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Allow Data Export" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Users can export their data" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.compliance?.allow_data_export || false,
                onChange: (e) => setData("compliance.allow_data_export", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Allow Data Deletion" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Users can request data deletion" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.compliance?.allow_data_deletion || false,
                onChange: (e) => setData("compliance.allow_data_deletion", e.target.checked),
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
  ComplianceTab as default
};
