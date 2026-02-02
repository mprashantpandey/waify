import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, b as CardTitle, c as CardContent } from "./Card-8uw03vLH.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Lock, Shield, Ban } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "react";
function SecurityTab({ data, setData, errors }) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5" }),
        "Password Policies"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.password_min_length", value: "Minimum Length" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.password_min_length",
                type: "number",
                value: data.security?.password_min_length || 8,
                onChange: (e) => setData("security.password_min_length", parseInt(e.target.value) || 8),
                className: "mt-1",
                min: "6",
                max: "128"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.password_min_length"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.password_max_length", value: "Maximum Length" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.password_max_length",
                type: "number",
                value: data.security?.password_max_length || 128,
                onChange: (e) => setData("security.password_max_length", parseInt(e.target.value) || 128),
                className: "mt-1",
                min: "8",
                max: "128"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.password_max_length"] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Require Uppercase Letters" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Passwords must contain at least one uppercase letter" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.security?.password_require_uppercase || false,
                  onChange: (e) => setData("security.password_require_uppercase", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Require Lowercase Letters" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Passwords must contain at least one lowercase letter" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.security?.password_require_lowercase || false,
                  onChange: (e) => setData("security.password_require_lowercase", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Require Numbers" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Passwords must contain at least one number" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.security?.password_require_numbers || false,
                  onChange: (e) => setData("security.password_require_numbers", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Require Special Characters" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Passwords must contain at least one special character" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.security?.password_require_symbols || false,
                  onChange: (e) => setData("security.password_require_symbols", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.password_expiry_days", value: "Password Expiry (Days)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.password_expiry_days",
                type: "number",
                value: data.security?.password_expiry_days || 0,
                onChange: (e) => setData("security.password_expiry_days", parseInt(e.target.value) || 0),
                className: "mt-1",
                min: "0",
                placeholder: "0 = Never expire"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "0 means passwords never expire" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.password_expiry_days"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.password_history_count", value: "Password History Count" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.password_history_count",
                type: "number",
                value: data.security?.password_history_count || 0,
                onChange: (e) => setData("security.password_history_count", parseInt(e.target.value) || 0),
                className: "mt-1",
                min: "0",
                max: "10"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Prevent reuse of last N passwords" }),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.password_history_count"] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }),
        "Authentication & Access"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Require Two-Factor Authentication" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: "Force all users to enable 2FA" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.security?.require_2fa || false,
                onChange: (e) => setData("security.require_2fa", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.session_timeout", value: "Session Timeout (Minutes)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.session_timeout",
                type: "number",
                value: data.security?.session_timeout || 120,
                onChange: (e) => setData("security.session_timeout", parseInt(e.target.value) || 120),
                className: "mt-1",
                min: "5",
                max: "1440"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.session_timeout"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.max_login_attempts", value: "Max Login Attempts" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.max_login_attempts",
                type: "number",
                value: data.security?.max_login_attempts || 5,
                onChange: (e) => setData("security.max_login_attempts", parseInt(e.target.value) || 5),
                className: "mt-1",
                min: "3",
                max: "10"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.max_login_attempts"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.lockout_duration", value: "Lockout Duration (Minutes)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.lockout_duration",
                type: "number",
                value: data.security?.lockout_duration || 15,
                onChange: (e) => setData("security.lockout_duration", parseInt(e.target.value) || 15),
                className: "mt-1",
                min: "1",
                max: "1440"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.lockout_duration"] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Ban, { className: "h-5 w-5" }),
        "Rate Limiting"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.api_rate_limit", value: "API Rate Limit (per minute)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.api_rate_limit",
                type: "number",
                value: data.security?.api_rate_limit || 60,
                onChange: (e) => setData("security.api_rate_limit", parseInt(e.target.value) || 60),
                className: "mt-1",
                min: "10"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.api_rate_limit"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.web_rate_limit", value: "Web Rate Limit (per minute)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "security.web_rate_limit",
                type: "number",
                value: data.security?.web_rate_limit || 120,
                onChange: (e) => setData("security.web_rate_limit", parseInt(e.target.value) || 120),
                className: "mt-1",
                min: "10"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["security.web_rate_limit"] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "security.ip_whitelist", value: "IP Whitelist (comma-separated)" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "security.ip_whitelist",
              type: "text",
              value: data.security?.ip_whitelist || "",
              onChange: (e) => setData("security.ip_whitelist", e.target.value),
              className: "mt-1",
              placeholder: "192.168.1.1, 10.0.0.0/8"
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Leave empty to allow all IPs" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["security.ip_whitelist"] })
        ] })
      ] })
    ] })
  ] });
}
export {
  SecurityTab as default
};
