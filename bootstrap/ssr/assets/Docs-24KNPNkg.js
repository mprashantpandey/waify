import { jsxs, jsx } from "react/jsx-runtime";
import { Head, Link } from "@inertiajs/react";
import { A as AppShell } from "./AppShell-C0ldGEwS.js";
import { C as Card, b as CardHeader, c as CardTitle, d as CardDescription, a as CardContent } from "./Card-DLPTnTfC.js";
import { ArrowLeft, BookOpen, Terminal, Key } from "lucide-react";
import "react";
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
import "./useToast-CwsXrmjR.js";
import "./BrandingWrapper-BZp9WdA-.js";
import "./Button-ymbdH_NY.js";
import "./Alert-C-mQ6HNk.js";
import "./CookieConsentBanner-BJ5KL4CC.js";
function DeveloperDocs({
  account,
  base_url,
  endpoints,
  available_scopes = []
}) {
  const methodColors = {
    GET: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    POST: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    PATCH: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx(Head, { title: "API documentation" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6 max-w-4xl", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(
        Link,
        {
          href: route("app.developer.index"),
          className: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-1 text-sm",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "Back to Developer"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8 text-indigo-500" }),
          "API documentation"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-600 dark:text-gray-400", children: "Reference for the Waify external API. Use your API key to authenticate requests." })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Terminal, { className: "h-5 w-5" }),
            "Base URL"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "All endpoints are relative to this base URL." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("code", { className: "block rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 px-4 py-3 font-mono text-sm", children: base_url }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Key, { className: "h-5 w-5" }),
            "Authentication"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Include your API key in every request. Create and manage keys on the Developer page." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 dark:text-gray-300", children: /* @__PURE__ */ jsx("strong", { children: "Option 1 – Bearer token (recommended)" }) }),
          /* @__PURE__ */ jsx("pre", { className: "rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-sm overflow-x-auto", children: `Authorization: Bearer wfy_your_api_key_here` }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-700 dark:text-gray-300 mt-4", children: /* @__PURE__ */ jsx("strong", { children: "Option 2 – X-API-Key header" }) }),
          /* @__PURE__ */ jsx("pre", { className: "rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-sm overflow-x-auto", children: `X-API-Key: wfy_your_api_key_here` }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-2", children: [
            "Unauthenticated requests will receive ",
            /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-200 dark:bg-gray-700 px-1", children: "401 Unauthorized" }),
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Available Scopes" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Assign only the scopes each integration needs." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "flex flex-wrap gap-2", children: available_scopes.map((scope) => /* @__PURE__ */ jsx("code", { className: "rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs", children: scope }, scope)) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Endpoints" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Available API endpoints for your account." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-6", children: endpoints.map((ep, idx) => /* @__PURE__ */ jsxs("div", { className: "border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx(
              "span",
              {
                className: `inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${methodColors[ep.method] ?? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`,
                children: ep.method
              }
            ),
            /* @__PURE__ */ jsx("code", { className: "font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded", children: ep.path })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-900 dark:text-gray-100 mt-2", children: ep.summary }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: ep.description }),
          ep.auth && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-500 mt-1", children: [
            "Requires API key",
            ep.scope ? ` with scope: ${ep.scope}` : "",
            "."
          ] }),
          /* @__PURE__ */ jsx("pre", { className: "mt-3 rounded-lg bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 text-xs overflow-x-auto whitespace-pre-wrap", children: ep.example })
        ] }, idx)) })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: [
        "Need an API key? Go to",
        " ",
        /* @__PURE__ */ jsx(Link, { href: route("app.developer.index"), className: "text-indigo-600 dark:text-indigo-400 hover:underline font-medium", children: "Developer → API keys" }),
        "."
      ] }) }) })
    ] })
  ] });
}
export {
  DeveloperDocs as default
};
