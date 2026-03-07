import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { B as Button } from "./Button-ymbdH_NY.js";
import { T as TextInput } from "./TextInput-Dl1_GoEA.js";
import { I as InputLabel } from "./InputLabel-CE_n4Upz.js";
import { I as InputError } from "./InputError-DiSBWiye.js";
import { Code2, BookOpen, Key, Check, Copy, AlertCircle, Plus, Trash2 } from "lucide-react";
import { u as useToast } from "./useToast-CwsXrmjR.js";
import { u as useConfirm } from "./useConfirm-BKf7Nv1N.js";
import "./utils-B2ZNUmII.js";
import "clsx";
import "tailwind-merge";
import "../ssr.js";
import "@inertiajs/react/server";
import "./vendor-BWyHebfG.js";
import "react-dom/server";
import "./Topbar-B0L72tZm.js";
import "./Badge-CHx1ViYT.js";
import "./GlobalFlashHandler-yL6veGcD.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function DeveloperIndex({
  account,
  api_keys,
  base_url,
  available_scopes = []
}) {
  const { addToast } = useToast();
  const confirm = useConfirm();
  const page = usePage();
  const flash = page.props.flash || {};
  const newApiKey = flash.new_api_key;
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    scopes: available_scopes,
    expires_in_days: ""
  });
  const [copied, setCopied] = useState(false);
  const handleCreateKey = (e) => {
    e.preventDefault();
    post(route("app.developer.api-keys.store"), {
      preserveScroll: true,
      onSuccess: () => reset()
    });
  };
  const handleRevoke = async (id, name) => {
    const ok = await confirm({
      title: "Revoke API key",
      message: `Revoke "${name}"? This cannot be undone. Any apps using this key will stop working.`,
      variant: "warning"
    });
    if (!ok) return;
    router.delete(route("app.developer.api-keys.destroy", { id }), { preserveScroll: true });
  };
  const copyKey = () => {
    if (!newApiKey?.key) return;
    navigator.clipboard.writeText(newApiKey.key).then(() => {
      setCopied(true);
      addToast({ title: "Copied", description: "API key copied to clipboard.", variant: "success" });
      setTimeout(() => setCopied(false), 2e3);
    }).catch(() => {
      addToast({ title: "Copy failed", description: "Clipboard access was blocked. Copy the key manually.", variant: "warning" });
    });
  };
  const toggleKey = (key) => {
    router.patch(route("app.developer.api-keys.update", { id: key.id }), {
      is_active: !key.is_active
    }, { preserveScroll: true });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Developer - API keys" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(Code2, { className: "h-8 w-8 text-indigo-500" }),
            "Developer"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Manage API keys and integrate with Waify via the external API." })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "secondary",
            onClick: () => router.visit(route("app.developer.docs")),
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsx(BookOpen, { className: "h-4 w-4" }),
              "API documentation"
            ]
          }
        )
      ] }),
      newApiKey && /* @__PURE__ */ jsxs(Card, { className: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-green-800 dark:text-green-200 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
            "New API key created"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Copy this key now. You won't be able to see it again." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("code", { className: "flex-1 rounded-lg bg-gray-900 text-green-300 px-3 py-2 text-sm font-mono break-all", children: newApiKey.key }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "secondary",
                size: "sm",
                onClick: copyKey,
                className: "gap-1 shrink-0",
                children: [
                  copied ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                  copied ? "Copied" : "Copy"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 shrink-0" }),
            "Store it securely. If you lose it, create a new key and revoke this one."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
            "API keys"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Create keys to authenticate with the Waify API. Use each key in one place (e.g. production, CI) so you can revoke it without affecting others." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateKey, className: "flex flex-wrap items-end gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-[200px]", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: "Key name" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "name",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  placeholder: "e.g. Production, CI",
                  className: "mt-1"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-[220px]", children: [
              /* @__PURE__ */ jsx(InputLabel, { htmlFor: "expires_in_days", value: "Expiry (days, optional)" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  id: "expires_in_days",
                  type: "number",
                  min: "1",
                  max: "3650",
                  value: data.expires_in_days,
                  onChange: (e) => setData("expires_in_days", e.target.value),
                  placeholder: "Never expires",
                  className: "mt-1"
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.expires_in_days })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
              /* @__PURE__ */ jsx(InputLabel, { value: "Scopes" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2", children: available_scopes.map((scope) => /* @__PURE__ */ jsxs("label", { className: "inline-flex items-center gap-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: Array.isArray(data.scopes) && data.scopes.includes(scope),
                    onChange: (e) => {
                      const current = Array.isArray(data.scopes) ? [...data.scopes] : [];
                      const next = e.target.checked ? Array.from(/* @__PURE__ */ new Set([...current, scope])) : current.filter((s) => s !== scope);
                      setData("scopes", next);
                    }
                  }
                ),
                /* @__PURE__ */ jsx("code", { className: "text-xs", children: scope })
              ] }, scope)) }),
              /* @__PURE__ */ jsx(InputError, { message: errors.scopes })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: processing, className: "gap-2", children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
              "Create key"
            ] })
          ] }),
          api_keys.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 py-4", children: "No API keys yet. Create one to start using the API." }) : /* @__PURE__ */ jsx("ul", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: api_keys.map((key) => /* @__PURE__ */ jsxs("li", { className: "py-3 flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2", children: [
                key.name,
                /* @__PURE__ */ jsx("span", { className: `inline-flex rounded-full px-2 py-0.5 text-[11px] ${key.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`, children: key.is_active ? "Active" : "Disabled" })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-mono text-gray-500 dark:text-gray-400", children: key.key_prefix }),
              /* @__PURE__ */ jsx("div", { className: "mt-1 flex flex-wrap gap-1", children: (key.scopes || []).map((scope) => /* @__PURE__ */ jsx("span", { className: "inline-flex rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px]", children: scope }, scope)) }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 dark:text-gray-500 mt-0.5", children: [
                "Created ",
                new Date(key.created_at).toLocaleDateString(),
                key.last_used_at && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " · Last used ",
                  new Date(key.last_used_at).toLocaleString()
                ] }),
                key.last_used_ip && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " · IP ",
                  key.last_used_ip
                ] }),
                key.expires_at && /* @__PURE__ */ jsxs(Fragment, { children: [
                  " · Expires ",
                  new Date(key.expires_at).toLocaleDateString()
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "secondary",
                  size: "sm",
                  onClick: () => toggleKey(key),
                  children: key.is_active ? "Disable" : "Enable"
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  className: "text-red-600 hover:text-red-700 dark:text-red-400",
                  onClick: () => handleRevoke(key.id, key.name),
                  children: [
                    /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-1" }),
                    "Revoke"
                  ]
                }
              )
            ] })
          ] }, key.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
          /* @__PURE__ */ jsx("strong", { children: "Base URL:" }),
          " ",
          /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5", children: base_url })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-2", children: [
          "Authenticate with ",
          /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5", children: "Authorization: Bearer YOUR_API_KEY" }),
          " or",
          " ",
          /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5", children: "X-API-Key: YOUR_API_KEY" }),
          ". See the API documentation for endpoints."
        ] })
      ] }) })
    ] })
  ] });
}
export {
  DeveloperIndex as default
};
