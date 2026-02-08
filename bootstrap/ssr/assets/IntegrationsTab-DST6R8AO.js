import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, b as CardHeader, c as CardTitle, a as CardContent } from "./Card-DLPTnTfC.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Key, EyeOff, Eye, Webhook, MessageCircle } from "lucide-react";
import { useState } from "react";
import { B as Button } from "./Button-ymbdH_NY.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function IntegrationsTab({ data, setData, errors }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showMetaSecret, setShowMetaSecret] = useState(false);
  const [showSystemToken, setShowSystemToken] = useState(false);
  const generateApiKey = () => {
    const key = "wacp_" + Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => b.toString(16).padStart(2, "0")).join("");
    setData("integrations.api_key", key);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
        "API Configuration"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "integrations.api_key", value: "API Key" }),
            /* @__PURE__ */ jsx(Button, { type: "button", variant: "secondary", size: "sm", onClick: generateApiKey, children: "Generate New Key" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "integrations.api_key",
                type: showApiKey ? "text" : "password",
                value: data.integrations?.api_key || "",
                onChange: (e) => setData("integrations.api_key", e.target.value),
                className: "pr-10 font-mono text-sm",
                placeholder: "wacp_..."
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowApiKey(!showApiKey),
                className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                children: showApiKey ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: "Use this key to authenticate API requests" }),
          /* @__PURE__ */ jsx(InputError, { message: errors["integrations.api_key"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "integrations.api_rate_limit", value: "API Rate Limit (per minute)" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "integrations.api_rate_limit",
                type: "number",
                value: data.integrations?.api_rate_limit || 60,
                onChange: (e) => setData("integrations.api_rate_limit", parseInt(e.target.value) || 60),
                className: "mt-1",
                min: "10"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["integrations.api_rate_limit"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Enable API" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Allow API access" })
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  checked: data.integrations?.api_enabled || false,
                  onChange: (e) => setData("integrations.api_enabled", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Webhook, { className: "h-5 w-5" }),
        "Webhook Configuration"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "integrations.webhook_url", value: "Webhook Base URL" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "integrations.webhook_url",
              type: "url",
              value: data.integrations?.webhook_url || "",
              onChange: (e) => setData("integrations.webhook_url", e.target.value),
              className: "mt-1",
              placeholder: "https://api.example.com/webhooks"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["integrations.webhook_url"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(InputLabel, { htmlFor: "integrations.webhook_secret", value: "Webhook Secret" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              id: "integrations.webhook_secret",
              type: "password",
              value: data.integrations?.webhook_secret || "",
              onChange: (e) => setData("integrations.webhook_secret", e.target.value),
              className: "mt-1",
              placeholder: "Secret for webhook signature verification"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors["integrations.webhook_secret"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Enable Webhooks" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Send webhook events to external URLs" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.integrations?.webhooks_enabled || false,
                onChange: (e) => setData("integrations.webhooks_enabled", e.target.checked),
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
        /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5" }),
        "Meta Embedded Signup"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { value: "Enable Embedded Signup" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Allow tenants to connect WhatsApp using Meta's Embedded Signup flow." })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                checked: data.whatsapp?.embedded_enabled ?? false,
                onChange: (e) => setData("whatsapp.embedded_enabled", e.target.checked),
                className: "sr-only peer"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "whatsapp.meta_app_id", value: "Meta App ID" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "whatsapp.meta_app_id",
                type: "text",
                value: data.whatsapp?.meta_app_id || "",
                onChange: (e) => setData("whatsapp.meta_app_id", e.target.value),
                className: "mt-1",
                placeholder: "123456789012345"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["whatsapp.meta_app_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "whatsapp.embedded_signup_config_id", value: "Embedded Signup Config ID" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "whatsapp.embedded_signup_config_id",
                type: "text",
                value: data.whatsapp?.embedded_signup_config_id || "",
                onChange: (e) => setData("whatsapp.embedded_signup_config_id", e.target.value),
                className: "mt-1",
                placeholder: "Your config ID"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["whatsapp.embedded_signup_config_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "whatsapp.meta_app_secret", value: "Meta App Secret" }),
            /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "whatsapp.meta_app_secret",
                  type: showMetaSecret ? "text" : "password",
                  value: data.whatsapp?.meta_app_secret || "",
                  onChange: (e) => setData("whatsapp.meta_app_secret", e.target.value),
                  className: "pr-10",
                  placeholder: "••••••••••"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowMetaSecret(!showMetaSecret),
                  className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  children: showMetaSecret ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors["whatsapp.meta_app_secret"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "whatsapp.system_user_token", value: "System User Token" }),
            /* @__PURE__ */ jsxs("div", { className: "relative mt-1", children: [
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "whatsapp.system_user_token",
                  type: showSystemToken ? "text" : "password",
                  value: data.whatsapp?.system_user_token || "",
                  onChange: (e) => setData("whatsapp.system_user_token", e.target.value),
                  className: "pr-10",
                  placeholder: "EAAB..."
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowSystemToken(!showSystemToken),
                  className: "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  children: showSystemToken ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors["whatsapp.system_user_token"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "whatsapp.api_version", value: "Graph API Version" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "whatsapp.api_version",
                type: "text",
                value: data.whatsapp?.api_version || "v21.0",
                onChange: (e) => setData("whatsapp.api_version", e.target.value),
                className: "mt-1",
                placeholder: "v21.0"
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors["whatsapp.api_version"] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  IntegrationsTab as default
};
