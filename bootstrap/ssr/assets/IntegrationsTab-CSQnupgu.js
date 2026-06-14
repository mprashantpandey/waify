import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Key, Check, Copy, RotateCcw, Webhook, MessageCircle, EyeOff, Eye } from "lucide-react";
import { B as Button } from "./Button-BJftGNki.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-BtIXZ0GS.js";
import { I as Input } from "./Input-DGMAswN3.js";
import { L as Label } from "./Label-DSCoVIUl.js";
import { S as Switch } from "./Switch-D6_sQewh.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
function FieldError({ message }) {
  if (!message) return null;
  return /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-300", children: message });
}
function SecretInput({
  id,
  value,
  onChange,
  placeholder
}) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        id,
        type: visible ? "text" : "password",
        value,
        onChange: (event) => onChange(event.target.value),
        className: "pr-10 font-mono",
        placeholder
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setVisible((current) => !current),
        className: "absolute right-2 top-1/2 rounded-btn p-1 text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text",
        "aria-label": visible ? "Hide secret" : "Show secret",
        children: visible ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
      }
    )
  ] });
}
function IntegrationsTab({ data, setData, errors }) {
  const integrations = data.integrations || {};
  const whatsapp = data.whatsapp || {};
  const [copied, setCopied] = useState(null);
  const generateApiKey = () => {
    const key = `wacp_${Array.from(crypto.getRandomValues(new Uint8Array(32))).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    setData("integrations.api_key", key);
  };
  const generateWebhookVerifyToken = () => {
    const token = `waify_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    setData("whatsapp.central_webhook_verify_token", token);
  };
  const copyValue = async (key, value) => {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(key);
    window.setTimeout(() => setCopied((current) => current === key ? null : current), 1500);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
          "Google OAuth"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Client used for Google login and future Google Calendar, Sheets, and Drive integrations." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Enable Google login" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "When enabled, users can sign in or create an account with Google OAuth." })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: integrations.google_oauth_enabled || false, onCheckedChange: (checked) => setData("integrations.google_oauth_enabled", checked) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "integrations.google_client_id", children: "Google Client ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "integrations.google_client_id",
                value: integrations.google_client_id || "",
                onChange: (event) => setData("integrations.google_client_id", event.target.value),
                placeholder: "000000000000-xxxx.apps.googleusercontent.com"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["integrations.google_client_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "integrations.google_client_secret", children: "Google Client Secret" }),
            /* @__PURE__ */ jsx(
              SecretInput,
              {
                id: "integrations.google_client_secret",
                value: integrations.google_client_secret || "",
                onChange: (value) => setData("integrations.google_client_secret", value),
                placeholder: "Google OAuth client secret"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["integrations.google_client_secret"] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-card border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-400/20 dark:bg-blue-400/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Authorized redirect URIs" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Add every URL below in Google Cloud Console for the OAuth web client." })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => copyValue("google-redirect", integrations.google_redirect_url), children: [
              copied === "google-redirect" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              copied === "google-redirect" ? "Copied" : "Copy"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-btn border border-blue-100 bg-white p-3 dark:border-blue-400/20 dark:bg-waify-dark-surface", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-1 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: "Google login" }),
              /* @__PURE__ */ jsx("p", { className: "break-all font-mono text-sm text-waify-text dark:text-waify-dark-text", children: integrations.google_redirect_url || "Save platform URL first" })
            ] }),
            Object.entries(integrations.google_integration_redirect_urls || {}).map(([label, url]) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 rounded-btn border border-blue-100 bg-white p-3 dark:border-blue-400/20 dark:bg-waify-dark-surface sm:flex-row sm:items-start sm:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "mb-1 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted", children: label }),
                /* @__PURE__ */ jsx("p", { className: "break-all font-mono text-sm text-waify-text dark:text-waify-dark-text", children: String(url) })
              ] }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => copyValue(`google-${label}`, String(url)), children: [
                copied === `google-${label}` ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                copied === `google-${label}` ? "Copied" : "Copy"
              ] })
            ] }, label))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-card border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-400/20 dark:bg-blue-400/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Facebook Login redirect URI" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Add this URL in the Meta app's Facebook Login settings for Meta Leads OAuth." })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => copyValue("facebook-redirect", integrations.facebook_redirect_url), children: [
              copied === "facebook-redirect" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              copied === "facebook-redirect" ? "Copied" : "Copy"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "break-all rounded-btn border border-blue-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-blue-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text", children: integrations.facebook_redirect_url || "Save platform URL first" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-card border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-400/20 dark:bg-blue-400/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Meta Lead Ads webhook callback URL" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Configure this once in the Meta app Webhooks product for leadgen events. Workspaces do not need their own callback URL." })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => copyValue("meta-leads-webhook", integrations.meta_leads_webhook_url), children: [
              copied === "meta-leads-webhook" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              copied === "meta-leads-webhook" ? "Copied" : "Copy"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "break-all rounded-btn border border-blue-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-blue-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text", children: integrations.meta_leads_webhook_url || "Save platform URL first" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
          "Public API"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Global API access gate used by public API middleware. Workspace keys are managed from Developer tools." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Enable platform API access" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Requests are still validated by API-key middleware." })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: integrations.api_enabled || false, onCheckedChange: (checked) => setData("integrations.api_enabled", checked) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "integrations.api_key", children: "Platform API Key" }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: generateApiKey, children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Generate"
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            SecretInput,
            {
              id: "integrations.api_key",
              value: integrations.api_key || "",
              onChange: (value) => setData("integrations.api_key", value),
              placeholder: "wacp_..."
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["integrations.api_key"] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "integrations.api_rate_limit", children: "API Rate Limit Per Minute" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "integrations.api_rate_limit",
              type: "number",
              value: integrations.api_rate_limit || 60,
              onChange: (event) => setData("integrations.api_rate_limit", parseInt(event.target.value, 10) || 60),
              min: "10"
            }
          ),
          /* @__PURE__ */ jsx(FieldError, { message: errors["integrations.api_rate_limit"] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Webhook, { className: "h-5 w-5" }),
          "Incoming Webhook Processing"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Controls whether platform webhook endpoints process requests such as Meta callbacks and Razorpay events." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Accept incoming webhooks" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "This does not configure customer outbound webhooks. Workspace outbound webhooks live in Developer tools." })
        ] }),
        /* @__PURE__ */ jsx(Switch, { checked: integrations.webhooks_enabled ?? true, onCheckedChange: (checked) => setData("integrations.webhooks_enabled", checked) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-5 w-5" }),
          "Meta WhatsApp Provider"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Provider-level Meta configuration used by embedded signup, central webhook verification, and signed event delivery." })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-3 rounded-card border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/10", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Meta webhook callback URL" }),
              /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Use this URL in Meta App Dashboard for WhatsApp provider webhooks. It handles both verification and incoming webhook events." })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", size: "sm", onClick: () => copyValue("webhook-url", whatsapp.central_webhook_url), children: [
              copied === "webhook-url" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              copied === "webhook-url" ? "Copied" : "Copy"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "break-all rounded-btn border border-emerald-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-emerald-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text", children: whatsapp.central_webhook_url || "Save platform URL first" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp.central_webhook_verify_token", children: "Meta Webhook Verify Token" }),
            /* @__PURE__ */ jsx(
              SecretInput,
              {
                id: "whatsapp.central_webhook_verify_token",
                value: whatsapp.central_webhook_verify_token || "",
                onChange: (value) => setData("whatsapp.central_webhook_verify_token", value),
                placeholder: "Custom verify token used in Meta webhook setup"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: "Enter the same value in Meta's Verify Token field. POST signature validation uses the Meta App Secret below." }),
            /* @__PURE__ */ jsx(FieldError, { message: errors["whatsapp.central_webhook_verify_token"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: generateWebhookVerifyToken, children: [
              /* @__PURE__ */ jsx(RotateCcw, { className: "h-4 w-4" }),
              "Generate"
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "secondary", onClick: () => copyValue("verify-token", whatsapp.central_webhook_verify_token), children: [
              copied === "verify-token" ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
              copied === "verify-token" ? "Copied" : "Copy"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 rounded-card border border-gray-100 p-4 dark:border-waify-dark-border", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Enable Embedded Signup" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "Allows workspaces to connect WhatsApp using Meta's embedded signup flow. The OAuth code/token returned by Meta is used for setup; no system user token is required." })
          ] }),
          /* @__PURE__ */ jsx(Switch, { checked: whatsapp.embedded_enabled ?? false, onCheckedChange: (checked) => setData("whatsapp.embedded_enabled", checked) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-card border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-400/10", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-waify-text dark:text-waify-dark-text", children: "Meta app domain requirement" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted", children: "In Meta App Dashboard, add this domain under App Domains and configure the Website platform URL. Embedded signup opens from the browser origin, so Meta rejects any domain that is missing there." }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-btn border border-amber-100 bg-white px-3 py-2 font-mono text-sm text-waify-text dark:border-amber-400/20 dark:bg-waify-dark-surface dark:text-waify-dark-text", children: whatsapp.app_domain || "Set General > Platform URL first" }),
          whatsapp.app_domain && !String(whatsapp.app_domain).startsWith("www.") ? /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted", children: [
            "Also add www.",
            whatsapp.app_domain,
            " if users can open the app on the www subdomain."
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp.meta_app_id", children: "Meta App ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "whatsapp.meta_app_id",
                value: whatsapp.meta_app_id || "",
                onChange: (event) => setData("whatsapp.meta_app_id", event.target.value),
                placeholder: "123456789012345"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["whatsapp.meta_app_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp.embedded_signup_config_id", children: "Embedded Signup Config ID" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "whatsapp.embedded_signup_config_id",
                value: whatsapp.embedded_signup_config_id || "",
                onChange: (event) => setData("whatsapp.embedded_signup_config_id", event.target.value),
                placeholder: "Your config ID"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["whatsapp.embedded_signup_config_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp.coexistence_signup_config_id", children: "Co-existence Config Override" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "whatsapp.coexistence_signup_config_id",
                value: whatsapp.coexistence_signup_config_id || "",
                onChange: (event) => setData("whatsapp.coexistence_signup_config_id", event.target.value),
                placeholder: "Leave blank to use Embedded Signup Config ID"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["whatsapp.coexistence_signup_config_id"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp.meta_app_secret", children: "Meta App Secret" }),
            /* @__PURE__ */ jsx(
              SecretInput,
              {
                id: "whatsapp.meta_app_secret",
                value: whatsapp.meta_app_secret || "",
                onChange: (value) => setData("whatsapp.meta_app_secret", value),
                placeholder: "Meta app secret"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["whatsapp.meta_app_secret"] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "whatsapp.api_version", children: "Graph API Version" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "whatsapp.api_version",
                value: whatsapp.api_version || "v25.0",
                onChange: (event) => setData("whatsapp.api_version", event.target.value),
                placeholder: "v25.0"
              }
            ),
            /* @__PURE__ */ jsx(FieldError, { message: errors["whatsapp.api_version"] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  IntegrationsTab as default
};
